import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.favorites.list(user.id);
  }

  @Post(':cleanerId')
  add(@CurrentUser() user: User, @Param('cleanerId') cleanerId: string) {
    return this.favorites.add(user.id, cleanerId);
  }

  @Delete(':cleanerId')
  remove(@CurrentUser() user: User, @Param('cleanerId') cleanerId: string) {
    return this.favorites.remove(user.id, cleanerId);
  }
}
