import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CleanersService } from './cleaners.service';
import { UpdateCleanerPresenceDto } from './dto';

@Controller('cleaners')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CLEANER')
export class CleanersController {
  constructor(private readonly cleaners: CleanersService) {}

  @Patch('presence')
  setPresence(@CurrentUser() user: User, @Body() dto: UpdateCleanerPresenceDto) {
    return this.cleaners.setOnline(user, dto);
  }

  @Get('earnings')
  earnings(@CurrentUser() user: User) {
    return this.cleaners.earnings(user.id);
  }

  @Post('documents')
  uploadDocument(
    @CurrentUser() user: User,
    @Body('type') type: string,
    @Body('url') url: string,
  ) {
    return this.cleaners.uploadDocument(user.id, type, url);
  }
}
