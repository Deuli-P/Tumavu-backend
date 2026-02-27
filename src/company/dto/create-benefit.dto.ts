import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateBenefitDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsInt()
  @Min(1)
  minPassages!: number;
}
