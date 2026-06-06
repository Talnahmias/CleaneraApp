import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';

@Controller('jobs/:jobId/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Get()
  list(@CurrentUser() user: User, @Param('jobId') jobId: string) {
    return this.chat.listMessages(jobId, user.id);
  }

  @Post()
  send(
    @CurrentUser() user: User,
    @Param('jobId') jobId: string,
    @Body('body') body: string,
  ) {
    return this.chat.sendMessage(jobId, user.id, body);
  }

  @Get('contact')
  contact(@CurrentUser() user: User, @Param('jobId') jobId: string) {
    return this.chat.getMaskedContact(jobId, user.id);
  }
}
