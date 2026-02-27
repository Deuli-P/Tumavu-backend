import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateContactDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  city?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  country?: string;
}
