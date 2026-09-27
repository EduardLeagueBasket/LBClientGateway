import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const teamTypes = ['LIGA', 'NACIONAL'] as const;

const categorias = [
  'jersey',
  'short',
  'medias',
  'llavero',
  'gorra',
  'bandana',
  'taza',
  'vaso',
  'balon',
  'sudadera',
  'bandera',
  'poster',
  'otro',
] as const;

/** Campos enviados en multipart/form-data (variantes e imagenesMeta como JSON). */
export class CreateProductFormDto {
  @IsString()
  @IsNotEmpty()
  teamId!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(teamTypes)
  teamType!: (typeof teamTypes)[number];

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(categorias)
  categoria!: (typeof categorias)[number];

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsString()
  @IsNotEmpty()
  variantes!: string;

  @IsString()
  @IsOptional()
  tags?: string;

  @IsString()
  @IsOptional()
  imagenesMeta?: string;
}
