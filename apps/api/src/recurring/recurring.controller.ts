import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateRecurringDto } from './dto';
import { RecurringService } from './recurring.service';

@Controller('recurring')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
export class RecurringController {
  constructor(private readonly recurring: RecurringService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.recurring.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateRecurringDto) {
    return this.recurring.create(user.id, dto);
  }

  @Delete(':id')
  cancel(@CurrentUser() user: User, @Param('id') id: string) {
    return this.recurring.cancel(user.id, id);
  }
}
