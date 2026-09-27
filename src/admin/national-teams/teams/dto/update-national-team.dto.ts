import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

const genders = ['male', 'female', 'mixed'] as const;
const categories = ['senior', 'u23', 'u19', 'u17', 'three_x_three'] as const;
const teamTypes = ['national_team', 'regional'] as const;

export class UpdateNationalTeamDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  countryCode?: string;

  @IsString()
  @IsOptional()
  @IsIn(genders)
  gender?: (typeof genders)[number];

  @IsString()
  @IsOptional()
  @IsIn(categories)
  category?: (typeof categories)[number];

  @IsString()
  @IsOptional()
  logo?: string | null;

  @IsString()
  @IsOptional()
  competitionId?: string | null;

  /** Usuario manager asignado a administrar la selección o equipo regional. */
  @IsString()
  @IsOptional()
  managerUserId?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  countryId?: string | null;

  @IsOptional()
  @IsIn(teamTypes)
  type?: (typeof teamTypes)[number];

  @ValidateIf((o: UpdateNationalTeamDto) => o.type === 'regional')
  @IsOptional()
  @IsString()
  region?: string | null;
}
