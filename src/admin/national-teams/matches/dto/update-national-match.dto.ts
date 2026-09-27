import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

const statuses = ['scheduled', 'live', 'finished', 'cancelled'] as const;

export class UpdateNationalMatchDto {
  @IsString()
  @IsOptional()
  nationalTeamId?: string;

  @IsString()
  @IsOptional()
  opponentName?: string;

  @IsString()
  @IsOptional()
  opponentCode?: string | null;

  @IsDateString()
  @IsOptional()
  matchDate?: string;

  @IsString()
  @IsOptional()
  venue?: string | null;

  @IsString()
  @IsOptional()
  city?: string | null;

  @IsString()
  @IsOptional()
  country?: string | null;

  @IsString()
  @IsOptional()
  competitionName?: string | null;

  @IsInt()
  @IsOptional()
  homeScore?: number | null;

  @IsInt()
  @IsOptional()
  awayScore?: number | null;

  @IsString()
  @IsOptional()
  @IsIn(statuses)
  status?: (typeof statuses)[number];

  @IsBoolean()
  @IsOptional()
  isHome?: boolean;
}
