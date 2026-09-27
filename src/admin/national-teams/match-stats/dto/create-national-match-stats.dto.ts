import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateNationalMatchStatsDto {
  @IsString()
  @IsNotEmpty()
  matchId: string;

  @IsNumber()
  @IsOptional()
  possessionHome?: number;

  @IsNumber()
  @IsOptional()
  possessionAway?: number;

  @IsNumber()
  @IsOptional()
  reboundsHome?: number;

  @IsNumber()
  @IsOptional()
  reboundsAway?: number;

  @IsNumber()
  @IsOptional()
  assistsHome?: number;

  @IsNumber()
  @IsOptional()
  assistsAway?: number;
}
