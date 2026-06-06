import { RecurringFrequency } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateRecurringDto {
  @IsString()
  addressId!: string;

  @IsString()
  serviceTypeId!: string;

  @IsEnum(RecurringFrequency)
  frequency!: RecurringFrequency;

  @IsDateString()
  nextRunAt!: string;

  @IsOptional()
  @IsString()
  preferredCleanerId?: string;
}
