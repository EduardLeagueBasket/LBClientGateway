import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

const genders = ['male', 'female', 'mixed'] as const;
const categories = ['senior', 'u23', 'u19', 'u17', 'three_x_three'] as const;
const teamTypes = ['national_team', 'regional'] as const;

export class CreateNationalTeamDto {
  @IsString()
  @IsNotEmpty()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  countryCode!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(genders)
  gender?: (typeof genders)[number];

  @IsString()
  @IsNotEmpty()
  @IsIn(categories)
  category?: (typeof categories)[number];

  @IsString()
  @IsOptional()
  logo?: string;

  /** Usuario manager asignado a administrar la selección o equipo regional. */
  @IsString()
  @IsOptional()
  managerUserId?: string;

  @IsString()
  @IsOptional()
  competitionId?: string;

  @IsString()
  @IsOptional()
  countryId?: string;

  @IsOptional()
  @IsIn(teamTypes)
  type?: (typeof teamTypes)[number];

  @ValidateIf((o: CreateNationalTeamDto) => o.type === 'regional')
  @IsString()
  @IsNotEmpty()
  region?: string;
}
