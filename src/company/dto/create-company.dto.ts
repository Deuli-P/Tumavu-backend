import { Type } from 'class-transformer';
import { IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';

class CreateCompanyAddressDto {
  @IsString()
  @MinLength(1)
  street!: string;

  @IsString()
  @MinLength(1)
  city!: string;

  @IsString()
  @MinLength(1)
  zipCode!: string;

  @IsString()
  @MinLength(1)
  country!: string;
}

export class CreateCompanyDto {
  @IsString()
  @MinLength(1)
  name!: string;

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
