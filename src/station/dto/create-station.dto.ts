import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString, MinLength, ValidateNested } from 'class-validator';

class CreateStationOfficeAddressDto {
  @IsString()
  @MinLength(1)
  street!: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsString()
  @MinLength(1)
  locality!: string;
}

export class CreateStationDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsInt()
  @IsPositive()
  countryId!: number;

  @ValidateNested()
  @Type(() => CreateStationOfficeAddressDto)
  officeAddress!: CreateStationOfficeAddressDto;
}
