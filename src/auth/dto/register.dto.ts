import { IsEmail, IsString, MinLength } from 'class-validator';

// Payload d'inscription.
export class RegisterDto {
  @IsString()
  @MinLength(1)
  firstname!: string;

  @IsString()
  @MinLength(1)
  lastname!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
