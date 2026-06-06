import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdateCleanerPresenceDto {
  @IsBoolean()
  isOnline!: boolean;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}
