import { IsEmail, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

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
  password!: string;

  @IsOptional()
  @IsUrl(
    { require_protocol: true },
    { message: 'photoPath doit etre une URL complete (https://...)' },
  )
  photoPath?: string;
}
