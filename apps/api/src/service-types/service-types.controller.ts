import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('service-types')
export class ServiceTypesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.serviceType.findMany({
      where: { isActive: true },
      orderBy: { basePriceCents: 'asc' },
    });
  }
}
