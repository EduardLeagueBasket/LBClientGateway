import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

const statuses = ['scheduled', 'live', 'finished', 'cancelled'] as const;

function toStringArray(value: unknown): string[] | undefined {
  if (value == null || value === '') return undefined;
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return undefined;
}

export class ListNationalMatchesQueryDto {
  @IsOptional()
  @Transform(({ value }) => toStringArray(value) ?? ['scheduled', 'live'])
  @IsArray()
  @IsIn(statuses, { each: true })
  statuses: (typeof statuses)[number][] = ['scheduled', 'live'];

  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true' || value === '1') return true;
    if (value === false || value === 'false' || value === '0') return false;
    return value as boolean;
  })
  @IsBoolean()
  matchDateFromToday = true;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
