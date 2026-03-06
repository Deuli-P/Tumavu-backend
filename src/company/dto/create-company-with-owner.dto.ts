import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsPositive, IsString, MinLength, ValidateNested } from 'class-validator';

class CreateOwnerDto {
  @IsString()
  @MinLength(1)
  firstName!: string;

  @IsString()
  @MinLength(1)
  lastName!: string;

  @IsEmail()
  email!: string;
}

class CreateCompanyWithOwnerAddressDto {
  @IsString()
  @MinLength(1)
  street!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  streetNumber?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsString()
  @MinLength(1)
  locality!: string;

  @IsInt()
  @IsPositive()
  countryId!: number;
}

export class CreateCompanyWithOwnerDto {
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
  @Type(() => CreateCompanyWithOwnerAddressDto)
  address!: CreateCompanyWithOwnerAddressDto;

  @IsInt()
  @IsPositive()
  stationId!: number;

  @ValidateNested()
  @Type(() => CreateOwnerDto)
  owner!: CreateOwnerDto;
}
