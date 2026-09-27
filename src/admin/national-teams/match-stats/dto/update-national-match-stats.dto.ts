import { IsNumber, IsOptional } from 'class-validator';

export class UpdateNationalMatchStatsDto {
  @IsNumber()
  @IsOptional()
  possessionHome?: number | null;

  @IsNumber()
  @IsOptional()
  possessionAway?: number | null;

  @IsNumber()
  @IsOptional()
  reboundsHome?: number | null;

  @IsNumber()
  @IsOptional()
  reboundsAway?: number | null;

  @IsNumber()
  @IsOptional()
  assistsHome?: number | null;

  @IsNumber()
  @IsOptional()
  assistsAway?: number | null;
}
