import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRatingDto } from './dto';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(fromUserId: string, dto: CreateRatingDto) {
    const job = await this.prisma.job.findUnique({ where: { id: dto.jobId } });
    if (!job || job.status !== 'COMPLETED') {
      throw new BadRequestException('Job must be completed');
    }
    if (job.customerId !== fromUserId && job.cleanerId !== fromUserId) {
      throw new ForbiddenException();
    }

    const toUserId =
      job.customerId === fromUserId ? job.cleanerId! : job.customerId;

    const rating = await this.prisma.rating.create({
      data: {
        jobId: dto.jobId,
        fromUserId,
        toUserId,
        score: dto.score,
        comment: dto.comment,
      },
    });

    const agg = await this.prisma.rating.aggregate({
      where: { toUserId },
      _avg: { score: true },
      _count: { score: true },
    });

    await this.prisma.cleanerProfile.updateMany({
      where: { userId: toUserId },
      data: {
        ratingAverage: agg._avg.score ?? 0,
        ratingCount: agg._count.score,
      },
    });

    return rating;
  }
}
