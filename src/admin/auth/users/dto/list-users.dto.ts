import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

/** Cuerpo HTTP para POST /users/list (filtros y paginación). El `admin` lo arma el gateway desde el JWT. */
export class ListUsersQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  sortField?: string;

  @IsString()
  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortDirection?: 'asc' | 'desc';

  @IsString()
  @IsOptional()
  typeUser?: string;
}
