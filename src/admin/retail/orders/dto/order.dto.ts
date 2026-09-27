import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const teamTypes = ['LIGA', 'NACIONAL'] as const;
const estados = [
  'PENDIENTE',
  'PAGADO',
  'ENVIADO',
  'ENTREGADO',
  'CANCELADO',
] as const;

export class ListOrdersQuery {
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
  @IsIn(estados)
  estado?: (typeof estados)[number];
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  usuarioId!: string;

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
}

export class UpdateOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(estados)
  estado!: (typeof estados)[number];
}
