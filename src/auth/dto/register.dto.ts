import { Type } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class RegisterAddressDto {
  @IsString()
  @MinLength(1)
  postal_code!: string;

  @IsString()
  @MinLength(1)
  city!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  country?: string;
}

// Payload d'inscription.
export class RegisterDto {
  @IsString()
  @MinLength(1)
  firstName!: string;

  @IsString()
  @MinLength(1)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @MinLength(8)
  confirmedPassword!: string;

  @IsString()
  @MinLength(1)
  gender!: string;

  @IsDateString()
  birthdate!: string;

  @IsString()
  @MinLength(1)
  phone!: string;

  @ValidateNested()
  @Type(() => RegisterAddressDto)
  address!: RegisterAddressDto;

  @IsBoolean()
  @Equals(true, { message: 'Vous devez accepter les conditions generales (cgv)' })
  cgv!: boolean;

  @IsOptional()
  @IsBoolean()
  newsletter?: boolean;
}
