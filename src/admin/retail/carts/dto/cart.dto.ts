import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const teamTypes = ['LIGA', 'NACIONAL'] as const;

export class GetCartQuery {
  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @IsString()
  @IsNotEmpty()
  teamId!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(teamTypes)
  teamType!: (typeof teamTypes)[number];

  @IsString()
  @IsOptional()
  usuarioId?: string;
}

export class ListCartsQuery {
  @IsString()
  @IsOptional()
  teamId?: string;

  @IsString()
  @IsOptional()
  @IsIn(teamTypes)
  teamType?: (typeof teamTypes)[number];

  @IsString()
  @IsOptional()
  usuarioId?: string;

  @IsString()
  @IsOptional()
  sessionId?: string;
}

export class AddCartItemDto {
  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @IsString()
  @IsNotEmpty()
  teamId!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(teamTypes)
  teamType!: (typeof teamTypes)[number];

  @IsString()
  @IsOptional()
  usuarioId?: string;

  @IsString()
  @IsNotEmpty()
  productoId!: string;

  @IsString()
  @IsNotEmpty()
  varianteSku!: string;

  @IsInt()
  @Min(1)
  cantidad!: number;
}

export class UpdateCartItemDto {
  @IsString()
  @IsNotEmpty()
  itemId!: string;

  @IsInt()
  @Min(1)
  cantidad!: number;
}
