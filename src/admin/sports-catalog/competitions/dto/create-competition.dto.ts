import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCompetitionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsString()
  @IsNotEmpty()
  gender!: string;

  @IsOptional()
  file?: Express.Multer.File;

  @IsOptional()
  logo?: string;

  @IsString()
  @IsNotEmpty()
  season!: string;

  @IsString()
  @IsNotEmpty()
  countryId!: string;

  @IsString()
  @IsOptional()
  createdById?: string;

  /** Usuario MANAGER_LEAGUE asignado a administrar esta competencia. */
  @IsString()
  @IsOptional()
  managerUserId?: string;
}
