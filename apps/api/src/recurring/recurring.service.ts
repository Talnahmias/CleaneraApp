import { Injectable, NotFoundException } from '@nestjs/common';
import { RecurringFrequency } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecurringDto } from './dto';

function addInterval(date: Date, frequency: RecurringFrequency): Date {
  const next = new Date(date);
  if (frequency === 'WEEKLY') next.setDate(next.getDate() + 7);
  else if (frequency === 'BIWEEKLY') next.setDate(next.getDate() + 14);
  else next.setMonth(next.getMonth() + 1);
  return next;
}

@Injectable()
export class RecurringService {
  constructor(private readonly prisma: PrismaService) {}

  list(customerId: string) {
    return this.prisma.recurringBooking.findMany({
      where: { customerId },
      include: { address: true, serviceType: true },
      orderBy: { nextRunAt: 'asc' },
    });
  }

  async create(customerId: string, dto: CreateRecurringDto) {
    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId: customerId },
    });
    if (!address) throw new NotFoundException('Address not found');

    return this.prisma.recurringBooking.create({
      data: {
        customerId,
        addressId: dto.addressId,
        serviceTypeId: dto.serviceTypeId,
        preferredCleanerId: dto.preferredCleanerId,
        frequency: dto.frequency,
        nextRunAt: new Date(dto.nextRunAt),
      },
      include: { address: true, serviceType: true },
    });
  }

  async cancel(customerId: string, id: string) {
    const booking = await this.prisma.recurringBooking.findFirst({
      where: { id, customerId },
    });
    if (!booking) throw new NotFoundException();

    return this.prisma.recurringBooking.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /** Called by a scheduler/cron to materialize due recurring bookings into jobs */
  async processDueBookings() {
    const due = await this.prisma.recurringBooking.findMany({
      where: { isActive: true, nextRunAt: { lte: new Date() } },
      include: { serviceType: true },
    });

    const created = [];
    for (const booking of due) {
      const job = await this.prisma.job.create({
        data: {
          customerId: booking.customerId,
          addressId: booking.addressId,
          serviceTypeId: booking.serviceTypeId,
          preferredCleanerId: booking.preferredCleanerId ?? undefined,
          scheduledAt: booking.nextRunAt,
          isOnDemand: false,
          priceCents: booking.serviceType.basePriceCents,
          durationMinutes: booking.serviceType.durationMinutes,
          recurringBookingId: booking.id,
          status: 'REQUESTED',
        },
      });

      await this.prisma.recurringBooking.update({
        where: { id: booking.id },
        data: { nextRunAt: addInterval(booking.nextRunAt, booking.frequency) },
      });

      created.push(job);
    }

    return created;
  }
}
