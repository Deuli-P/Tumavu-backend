import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString, MinLength, ValidateNested } from 'class-validator';

class CreateCompanyAddressDto {
  @IsString()
  @MinLength(1)
  street!: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsString()
  @MinLength(1)
  locality!: string;

  @IsInt()
  @IsPositive()
  countryId!: number;
}

export class CreateCompanyDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  type?: string;

  @ValidateNested()
  @Type(() => CreateCompanyAddressDto)
  address!: CreateCompanyAddressDto;
}
