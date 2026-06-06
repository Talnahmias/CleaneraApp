import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRatingDto } from './dto';
import { RatingsService } from './ratings.service';

@Controller('ratings')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(private readonly ratings: RatingsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateRatingDto) {
    return this.ratings.create(user.id, dto);
  }
}
