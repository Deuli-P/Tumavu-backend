import { IsEmail, IsString, MinLength } from 'class-validator';

// Payload de connexion.
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
