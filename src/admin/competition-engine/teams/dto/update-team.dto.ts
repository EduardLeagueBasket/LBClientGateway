import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { toOptionalBoolean } from './boolean.helpers';

export class UpdateEngineTeamDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  logo?: string | null;

  @IsString()
  @IsOptional()
  groupId?: string | null;

  /** Solo ADMIN / SUPER_ADMIN pueden reasignar la liga del equipo. */
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  )
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  competitionId?: string;

  @Transform(({ value }) => toOptionalBoolean(value))
  @IsBoolean()
  @IsOptional()
  sellsTickets?: boolean;

  @Transform(({ value }) => toOptionalBoolean(value))
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
