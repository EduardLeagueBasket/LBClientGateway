import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateEngineGroupDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}

