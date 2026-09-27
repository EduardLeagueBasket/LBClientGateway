import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateArticleCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;
}
