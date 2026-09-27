import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const statuses = ['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED'] as const;
const matchTypes = ['LEAGUE', 'FRIENDLY', 'TOURNAMENT', 'INTERNATIONAL'] as const;

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

export class MobileListLeagueMatchesQueryDto {
  @IsOptional()
  @Transform(({ value }) => toStringArray(value) ?? ['SCHEDULED', 'LIVE'])
  @IsArray()
  @IsIn(statuses, { each: true })
  statuses: (typeof statuses)[number][] = ['SCHEDULED', 'LIVE'];

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsIn(matchTypes, { each: true })
  matchTypes?: (typeof matchTypes)[number][];

  @IsOptional()
  @IsString()
  seasonId?: string;

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
  limit = 50;
}
