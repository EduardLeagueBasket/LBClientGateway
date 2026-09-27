import { IsDateString, IsIn, IsInt, IsOptional, IsString } from 'class-validator';

const matchStatuses = ['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED'] as const;

export class UpdateEngineMatchDto {
  @IsDateString()
  @IsOptional()
  matchDate?: string;

  @IsString()
  @IsOptional()
  @IsIn(matchStatuses)
  status?: (typeof matchStatuses)[number];

  @IsInt()
  @IsOptional()
  homeScore?: number | null;

  @IsInt()
  @IsOptional()
  awayScore?: number | null;

  @IsString()
  @IsOptional()
  venue?: string | null;
}

