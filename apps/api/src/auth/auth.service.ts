import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const DEV_OTP = '123456';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async requestOtp(phone: string) {
    // Production: send SMS via Twilio
    return { phone, message: 'OTP sent (use 123456 in development)' };
  }

  async verifyOtp(phone: string, code: string, role: UserRole = UserRole.CUSTOMER) {
    if (code !== DEV_OTP) {
      throw new UnauthorizedException('Invalid OTP');
    }

    let user = await this.prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          role,
          firstName: 'New',
          lastName: 'User',
          ...(role === UserRole.CLEANER
            ? { cleanerProfile: { create: {} } }
            : {}),
        },
      });
    }

    const token = await this.jwt.signAsync({ sub: user.id, role: user.role });
    return { accessToken: token, user };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { cleanerProfile: true },
    });
  }
}
