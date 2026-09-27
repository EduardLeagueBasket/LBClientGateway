import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateEngineStandingDto {
  @IsString()
  @IsNotEmpty()
  competitionId: string;

  @IsString()
  @IsNotEmpty()
  seasonId: string;

  @IsString()
  @IsNotEmpty()
  teamId: string;

  @IsString()
  @IsOptional()
  groupId?: string;

  @IsInt()
  @Min(1)
  position: number;
}

