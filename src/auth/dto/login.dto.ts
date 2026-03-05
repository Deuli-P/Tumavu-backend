import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export type LoginAs = 'USER' | 'MANAGER' | 'ADMIN';

// Payload de connexion.
export class LoginDto {
  @IsEmail()
  @MaxLength(128)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsEnum(['USER', 'MANAGER', 'ADMIN'])
  as?: LoginAs;
}
