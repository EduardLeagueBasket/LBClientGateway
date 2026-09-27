import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum EngineSeasonStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export class CreateEngineSeasonDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  competitionId!: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(EngineSeasonStatus)
  @IsOptional()
  status?: EngineSeasonStatus;
}

export class UpdateEngineSeasonDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(EngineSeasonStatus)
  @IsOptional()
  status?: EngineSeasonStatus;
}

export class SetSeasonTeamsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  teamIds!: string[];
}

export class EnrollSeasonTeamDto {
  @IsUUID()
  @IsNotEmpty()
  teamId!: string;

  @IsString()
  @IsOptional()
  groupId?: string | null;
}
