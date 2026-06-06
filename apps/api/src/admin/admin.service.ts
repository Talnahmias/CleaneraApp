import { Injectable, NotFoundException } from '@nestjs/common';
import { CleanerVerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  listPendingCleaners() {
    return this.prisma.cleanerProfile.findMany({
      where: { verificationStatus: 'PENDING' },
      include: { user: { include: { documents: true } } },
    });
  }

  async setCleanerStatus(userId: string, status: CleanerVerificationStatus) {
    const profile = await this.prisma.cleanerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException();

    return this.prisma.cleanerProfile.update({
      where: { userId },
      data: { verificationStatus: status },
    });
  }

  listJobs() {
    return this.prisma.job.findMany({
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
        cleaner: { select: { id: true, firstName: true, lastName: true } },
        payment: true,
        serviceType: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async refundJob(jobId: string, amountCents?: number) {
    const payment = await this.prisma.payment.findUnique({ where: { jobId } });
    if (!payment) throw new NotFoundException('Payment not found');

    const refund = amountCents ?? payment.amountCents;
    return this.prisma.payment.update({
      where: { jobId },
      data: {
        status: 'REFUNDED',
        refundedCents: refund,
      },
    });
  }
}
