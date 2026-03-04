import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsPositive } from 'class-validator';

export class ListAnnonceAdminDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map(Number)
      : value
      ? [Number(value)]
      : undefined,
  )
  stationIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map(Number)
      : value
      ? [Number(value)]
      : undefined,
  )
  tagIds?: number[];
}
