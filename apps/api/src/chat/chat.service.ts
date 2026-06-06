import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async listMessages(jobId: string, userId: string) {
    await this.assertParticipant(jobId, userId);
    return this.prisma.chatMessage.findMany({
      where: { jobId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(jobId: string, senderId: string, body: string) {
    const job = await this.assertParticipant(jobId, senderId);
    const recipientId = job.customerId === senderId ? job.cleanerId : job.customerId;

    const message = await this.prisma.chatMessage.create({
      data: { jobId, senderId, body },
    });

    if (recipientId) {
      await this.notifications.notify(
        recipientId,
        'PUSH',
        'CHAT_MESSAGE',
        'New message',
        body.slice(0, 80),
        { jobId },
      );
    }

    return message;
  }

  /** Masked phone relay — production would use Twilio proxy numbers */
  getMaskedContact(jobId: string, userId: string) {
    return this.assertParticipant(jobId, userId).then((job) => ({
      jobId,
      relayNumber: '+1555000' + job.id.slice(-4),
      note: 'Calls/SMS are routed through a masked number in production',
    }));
  }

  private async assertParticipant(jobId: string, userId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new ForbiddenException();
    if (job.customerId !== userId && job.cleanerId !== userId) {
      throw new ForbiddenException();
    }
    return job;
  }
}
