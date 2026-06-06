import { Body, Controller, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { IsEnum, IsPhoneNumber, IsString } from 'class-validator';
import { AuthService } from './auth.service';

class RequestOtpDto {
  @IsString()
  phone!: string;
}

class VerifyOtpDto {
  @IsString()
  phone!: string;

  @IsString()
  code!: string;

  @IsEnum(UserRole)
  role: UserRole = UserRole.CUSTOMER;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('otp/request')
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.auth.requestOtp(dto.phone);
  }

  @Post('otp/verify')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.phone, dto.code, dto.role);
  }
}
