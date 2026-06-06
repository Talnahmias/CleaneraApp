import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  list(customerId: string) {
    return this.prisma.favoriteCleaner.findMany({
      where: { customerId },
      include: {
        cleaner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            cleanerProfile: true,
          },
        },
      },
    });
  }

  async add(customerId: string, cleanerId: string) {
    const cleaner = await this.prisma.user.findFirst({
      where: { id: cleanerId, role: 'CLEANER' },
    });
    if (!cleaner) throw new BadRequestException('Invalid cleaner');

    return this.prisma.favoriteCleaner.upsert({
      where: { customerId_cleanerId: { customerId, cleanerId } },
      update: {},
      create: { customerId, cleanerId },
    });
  }

  async remove(customerId: string, cleanerId: string) {
    await this.prisma.favoriteCleaner.deleteMany({ where: { customerId, cleanerId } });
    return { deleted: true };
  }
}
