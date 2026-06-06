import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JobStatus, PaymentStatus, User, UserRole } from '@prisma/client';
import { MatchingService } from '../matching/matching.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto, UpdateJobStatusDto } from './dto';

const STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  REQUESTED: [JobStatus.MATCHING, JobStatus.CANCELLED],
  MATCHING: [JobStatus.ASSIGNED, JobStatus.CANCELLED],
  ASSIGNED: [JobStatus.EN_ROUTE, JobStatus.CANCELLED],
  EN_ROUTE: [JobStatus.ARRIVED, JobStatus.CANCELLED],
  ARRIVED: [JobStatus.IN_PROGRESS, JobStatus.CANCELLED],
  IN_PROGRESS: [JobStatus.COMPLETED, JobStatus.CANCELLED],
  COMPLETED: [JobStatus.DISPUTED],
  CANCELLED: [],
  DISPUTED: [],
};

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matching: MatchingService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(customer: User, dto: CreateJobDto) {
    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId: customer.id },
    });
    if (!address) throw new NotFoundException('Address not found');

    const serviceType = await this.prisma.serviceType.findUnique({
      where: { id: dto.serviceTypeId },
      include: { checklistTemplates: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!serviceType?.isActive) throw new NotFoundException('Service type not found');

    if (dto.preferredCleanerId) {
      const favorite = await this.prisma.favoriteCleaner.findUnique({
        where: {
          customerId_cleanerId: {
            customerId: customer.id,
            cleanerId: dto.preferredCleanerId,
          },
        },
      });
      if (!favorite) throw new BadRequestException('Preferred cleaner must be a favorite');
    }

    const job = await this.prisma.job.create({
      data: {
        customerId: customer.id,
        addressId: dto.addressId,
        serviceTypeId: dto.serviceTypeId,
        isOnDemand: dto.isOnDemand ?? true,
        scheduledAt: new Date(dto.scheduledAt),
        priceCents: serviceType.basePriceCents,
        durationMinutes: serviceType.durationMinutes,
        preferredCleanerId: dto.preferredCleanerId,
        status: JobStatus.REQUESTED,
        checklist: {
          create: serviceType.checklistTemplates.map((item) => ({
            label: item.label,
            sortOrder: item.sortOrder,
          })),
        },
        payment: {
          create: {
            amountCents: serviceType.basePriceCents,
            platformFeeCents: Math.round(serviceType.basePriceCents * 0.2),
            cleanerPayoutCents: Math.round(serviceType.basePriceCents * 0.8),
            status: PaymentStatus.AUTHORIZED,
          },
        },
      },
      include: this.jobInclude(),
    });

    await this.matching.startMatching(job.id);
    return this.findOne(job.id, customer);
  }

  async findAllForUser(user: User) {
    const where =
      user.role === UserRole.CLEANER
        ? { OR: [{ cleanerId: user.id }, { offers: { some: { cleanerId: user.id } } }] }
        : { customerId: user.id };

    return this.prisma.job.findMany({
      where,
      include: this.jobInclude(),
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async findOne(id: string, user: User) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: this.jobInclude(),
    });
    if (!job) throw new NotFoundException('Job not found');

    const allowed =
      job.customerId === user.id ||
      job.cleanerId === user.id ||
      user.role === UserRole.ADMIN ||
      job.offers.some((o) => o.cleanerId === user.id);

    if (!allowed) throw new ForbiddenException();
    return job;
  }

  async updateStatus(id: string, user: User, dto: UpdateJobStatusDto) {
    const job = await this.findOne(id, user);
    this.assertCanUpdateStatus(job, user, dto.status);

    const data: Record<string, unknown> = { status: dto.status };
    if (dto.status === JobStatus.IN_PROGRESS) data.startedAt = new Date();
    if (dto.status === JobStatus.COMPLETED) data.completedAt = new Date();
    if (dto.status === JobStatus.CANCELLED) {
      data.cancelledAt = new Date();
      data.cancelReason = dto.cancelReason;
    }
    if (dto.status === JobStatus.EN_ROUTE && user.role === UserRole.CLEANER) {
      await this.notifications.notify(
        job.customerId,
        'PUSH',
        'CLEANER_EN_ROUTE',
        'Cleaner en route',
        'Your cleaner is on the way.',
        { jobId: id },
      );
    }
    if (dto.status === JobStatus.COMPLETED) {
      await this.notifications.notify(
        job.customerId,
        'PUSH',
        'JOB_COMPLETED',
        'Cleaning complete',
        'Please rate your cleaner.',
        { jobId: id },
      );
      await this.prisma.payment.update({
        where: { jobId: id },
        data: { status: PaymentStatus.CAPTURED },
      });
    }

    return this.prisma.job.update({
      where: { id },
      data,
      include: this.jobInclude(),
    });
  }

  async toggleChecklistItem(jobId: string, user: User, itemId: string, completed: boolean) {
    const job = await this.findOne(jobId, user);
    if (job.cleanerId !== user.id) throw new ForbiddenException();

    return this.prisma.jobChecklistItem.update({
      where: { id: itemId },
      data: {
        isCompleted: completed,
        completedAt: completed ? new Date() : null,
      },
    });
  }

  async addPhoto(
    jobId: string,
    user: User,
    url: string,
    type: 'COMPLETION' | 'ISSUE' = 'COMPLETION',
  ) {
    const job = await this.findOne(jobId, user);
    if (job.cleanerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }

    return this.prisma.jobPhoto.create({
      data: { jobId, uploaderId: user.id, url, type },
    });
  }

  private assertCanUpdateStatus(
    job: { status: JobStatus; customerId: string; cleanerId: string | null },
    user: User,
    next: JobStatus,
  ) {
    if (!STATUS_TRANSITIONS[job.status].includes(next)) {
      throw new BadRequestException(`Cannot transition ${job.status} → ${next}`);
    }

    const cleanerStatuses: JobStatus[] = [
      JobStatus.EN_ROUTE,
      JobStatus.ARRIVED,
      JobStatus.IN_PROGRESS,
      JobStatus.COMPLETED,
    ];
    const customerStatuses: JobStatus[] = [JobStatus.CANCELLED, JobStatus.DISPUTED];

    if (cleanerStatuses.includes(next) && job.cleanerId !== user.id) {
      throw new ForbiddenException();
    }
    if (customerStatuses.includes(next) && job.customerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }
  }

  private jobInclude() {
    return {
      address: true,
      serviceType: true,
      cleaner: { select: { id: true, firstName: true, lastName: true } },
      payment: true,
      checklist: { orderBy: { sortOrder: 'asc' as const } },
      photos: true,
      offers: true,
      chatMessages: { orderBy: { createdAt: 'asc' as const }, take: 50 },
    };
  }
}
