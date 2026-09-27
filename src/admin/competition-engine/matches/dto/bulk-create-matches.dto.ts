import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateEngineMatchDto } from './create-match.dto';

export class BulkCreateEngineMatchesDto {
  @IsString()
  @IsNotEmpty()
  competitionId: string;

  @IsString()
  @IsOptional()
  seasonId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateEngineMatchDto)
  matches: CreateEngineMatchDto[];
}
