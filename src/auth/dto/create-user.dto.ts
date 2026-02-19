import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

// DTO du body pour POST /auth/create-user
// Ce fichier definit la forme attendue de la requete.
export class CreateUserDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  firstName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  lastName!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(16)
  @MaxLength(255)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  photoPath?: string;
}
