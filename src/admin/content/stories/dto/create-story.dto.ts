import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const mediaTypes = ['photo', 'video'] as const;

export class CreateStoryDto {
  /** Opcional si se envía el archivo en multipart (`file`). */
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(mediaTypes)
  mediaType!: (typeof mediaTypes)[number];

  /** SUPER_ADMIN/ADMIN: publisher explícito. Staff: se ignora (usa afiliación). */
  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  /**
   * País destino de la story (solo relevante para publisher platform / League Basket).
   * GLOBAL = todos los países. CO/PA/... = solo ese feed.
   */
  @IsOptional()
  @IsString()
  targetCountryCode?: string;
}
