import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateEngineStandingDto {
  @IsString()
  @IsOptional()
  groupId?: string | null;

  @IsInt()
  @Min(0)
  @IsOptional()
  played?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  wins?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  losses?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  pointsFor?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  pointsAgainst?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  points?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  position?: number;
}

