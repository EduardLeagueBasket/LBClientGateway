import { IsNotEmpty, IsString } from 'class-validator';

export class RecalculateStandingsDto {
  @IsString()
  @IsNotEmpty()
  competitionId: string;

  @IsString()
  @IsNotEmpty()
  seasonId: string;
}
