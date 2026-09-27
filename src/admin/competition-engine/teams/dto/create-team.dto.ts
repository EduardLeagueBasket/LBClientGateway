import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { toOptionalBoolean } from './boolean.helpers';

export class CreateEngineTeamDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  /** URL del logo si el cliente envía JSON (legacy). Preferir archivo en multipart. */
  @IsString()
  @IsOptional()
  logo?: string;

  /** Alias usado por el backoffice; el gateway lo mapea a `logo`. */
  @IsString()
  @IsOptional()
  logoUrl?: string;

  /** Obligatorio para admin; el gerente de liga lo resuelve el gateway. */
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  )
  @IsString()
  @IsOptional()
  competitionId?: string;

  @IsString()
  @IsOptional()
  groupId?: string;

  /** Solo backoffice / dominio de negocio; no se persiste en competition-engine. */
  @IsString()
  @IsOptional()
  managerUserId?: string;

  @Transform(({ value }) => toOptionalBoolean(value))
  @IsBoolean()
  @IsOptional()
  sellsTickets?: boolean;

  @Transform(({ value }) => toOptionalBoolean(value))
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
