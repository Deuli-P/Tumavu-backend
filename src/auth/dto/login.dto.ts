import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

// Payload de connexion.
export class LoginDto {
  @IsEmail()
  @MaxLength(128)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
