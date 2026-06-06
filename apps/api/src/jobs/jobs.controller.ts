import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MatchingService } from '../matching/matching.service';
import { CreateJobDto, UpdateJobStatusDto } from './dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(
    private readonly jobs: JobsService,
    private readonly matching: MatchingService,
  ) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateJobDto) {
    return this.jobs.create(user, dto);
  }

  @Get()
  list(@CurrentUser() user: User) {
    return this.jobs.findAllForUser(user);
  }

  @Get(':id')
  get(@CurrentUser() user: User, @Param('id') id: string) {
    return this.jobs.findOne(id, user);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateJobStatusDto,
  ) {
    return this.jobs.updateStatus(id, user, dto);
  }

  @Post('offers/:offerId/accept')
  acceptOffer(@CurrentUser() user: User, @Param('offerId') offerId: string) {
    return this.matching.acceptOffer(offerId, user.id);
  }

  @Patch(':id/checklist/:itemId')
  toggleChecklist(
    @CurrentUser() user: User,
    @Param('id') jobId: string,
    @Param('itemId') itemId: string,
    @Body('completed') completed: boolean,
  ) {
    return this.jobs.toggleChecklistItem(jobId, user, itemId, completed);
  }

  @Post(':id/photos')
  addPhoto(
    @CurrentUser() user: User,
    @Param('id') jobId: string,
    @Body('url') url: string,
    @Body('type') type?: 'COMPLETION' | 'ISSUE',
  ) {
    return this.jobs.addPhoto(jobId, user, url, type);
  }
}
