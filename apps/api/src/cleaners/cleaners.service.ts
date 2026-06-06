import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCleanerPresenceDto } from './dto';

@Injectable()
export class CleanersService {
  constructor(private readonly prisma: PrismaService) {}

  async setOnline(user: User, dto: UpdateCleanerPresenceDto) {
    return this.prisma.cleanerProfile.update({
      where: { userId: user.id },
      data: {
        isOnline: dto.isOnline,
        lastLat: dto.lat,
        lastLng: dto.lng,
      },
    });
  }

  async earnings(userId: string) {
    const jobs = await this.prisma.job.findMany({
      where: { cleanerId: userId, status: 'COMPLETED' },
      include: { payment: true, serviceType: true },
      orderBy: { completedAt: 'desc' },
    });

    const totalCents = jobs.reduce(
      (sum, job) => sum + (job.payment?.cleanerPayoutCents ?? 0),
      0,
    );

    return { totalCents, jobs };
  }

  async uploadDocument(userId: string, type: string, url: string) {
    return this.prisma.document.create({
      data: { userId, type, url },
    });
  }
}
