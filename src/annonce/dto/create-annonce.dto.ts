import { IsDateString, IsInt, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateAnnonceDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsInt()
  @IsPositive()
  companyId!: number;
}
