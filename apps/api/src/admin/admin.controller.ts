import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CleanerVerificationStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('cleaners/pending')
  pendingCleaners() {
    return this.admin.listPendingCleaners();
  }

  @Patch('cleaners/:userId/status')
  setCleanerStatus(
    @Param('userId') userId: string,
    @Body('status') status: CleanerVerificationStatus,
  ) {
    return this.admin.setCleanerStatus(userId, status);
  }

  @Get('jobs')
  jobs() {
    return this.admin.listJobs();
  }

  @Post('jobs/:jobId/refund')
  refund(@Param('jobId') jobId: string, @Body('amountCents') amountCents?: number) {
    return this.admin.refundJob(jobId, amountCents);
  }
}
