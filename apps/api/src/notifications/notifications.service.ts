import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel, NotificationEvent, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async notify(
    userId: string,
    channel: NotificationChannel,
    event: NotificationEvent,
    title: string,
    body: string,
    payload?: Record<string, unknown>,
  ) {
    const record = await this.prisma.notification.create({
      data: {
        userId,
        channel,
        event,
        title,
        body,
        payload: payload as Prisma.InputJsonValue | undefined,
        sentAt: new Date(),
      },
    });

    // Production: integrate FCM / Twilio
    this.logger.log(`[${channel}] ${event} → user ${userId}: ${title}`);
    return record;
  }

  async notifyJobMatched(customerId: string, cleanerId: string, jobId: string) {
    await Promise.all([
      this.notify(
        customerId,
        NotificationChannel.PUSH,
        NotificationEvent.JOB_MATCHED,
        'Cleaner assigned',
        'Your cleaner is on the way.',
        { jobId },
      ),
      this.notify(
        cleanerId,
        NotificationChannel.PUSH,
        NotificationEvent.JOB_OFFER,
        'New job assigned',
        'You have been assigned a cleaning job.',
        { jobId },
      ),
    ]);
  }
}
