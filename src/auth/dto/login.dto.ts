import { IsEmail, IsString, Max, MinLength } from 'class-validator';

// Payload de connexion.
export class LoginDto {
  @IsEmail()
  @Max(128)
  email!: string;

  @IsString()
  @MinLength(8)
  @Max(128)
  password!: string;
}
