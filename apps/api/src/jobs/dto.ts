import { JobStatus } from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateJobDto {
  @IsString()
  addressId!: string;

  @IsString()
  serviceTypeId!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsBoolean()
  isOnDemand?: boolean;

  @IsOptional()
  @IsString()
  preferredCleanerId?: string;
}

export class UpdateJobStatusDto {
  @IsEnum(JobStatus)
  status!: JobStatus;

  @IsOptional()
  @IsString()
  cancelReason?: string;
}
