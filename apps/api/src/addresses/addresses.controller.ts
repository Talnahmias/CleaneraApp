import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto';

@Controller('addresses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
export class AddressesController {
  constructor(private readonly addresses: AddressesService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.addresses.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateAddressDto) {
    return this.addresses.create(user, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.addresses.remove(user.id, id);
  }
}
