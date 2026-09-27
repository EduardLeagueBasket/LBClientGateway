import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

const matchStatuses = ['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED'] as const;
const matchTypes = ['LEAGUE', 'FRIENDLY', 'TOURNAMENT', 'INTERNATIONAL'] as const;

export class CreateEngineMatchDto {
  @IsString()
  @IsOptional()
  competitionId?: string;

  @IsString()
  @IsOptional()
  seasonId?: string;

  @IsString()
  @IsNotEmpty()
  homeTeamId: string;

  @ValidateIf((o: CreateEngineMatchDto) => !o.awayTeamName)
  @IsString()
  @IsNotEmpty()
  awayTeamId?: string;

  @ValidateIf((o: CreateEngineMatchDto) => !o.awayTeamId)
  @IsString()
  @IsNotEmpty()
  awayTeamName?: string;

  @IsString()
  @IsOptional()
  @IsIn(matchTypes)
  matchType?: (typeof matchTypes)[number];

  @IsDateString()
  matchDate: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(matchStatuses)
  status: (typeof matchStatuses)[number];

  @IsString()
  @IsOptional()
  venue?: string;
}
