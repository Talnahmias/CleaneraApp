import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsString()
  jobId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  score!: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
