import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

const statuses = ['scheduled', 'live', 'finished', 'cancelled'] as const;

export class CreateNationalMatchDto {
  @IsString()
  @IsNotEmpty()
  nationalTeamId!: string;

  @IsString()
  @IsNotEmpty()
  opponentName!: string;

  @IsString()
  @IsOptional()
  opponentCode?: string;

  @IsDateString()
  matchDate!: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  competitionName?: string;

  @IsInt()
  @IsOptional()
  homeScore?: number;

  @IsInt()
  @IsOptional()
  awayScore?: number;

  @IsString()
  @IsOptional()
  @IsIn(statuses)
  status?: (typeof statuses)[number];

  @IsBoolean()
  @IsOptional()
  isHome?: boolean;
}
