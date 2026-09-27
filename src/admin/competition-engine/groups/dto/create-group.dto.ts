import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEngineGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  competitionId: string;
}

