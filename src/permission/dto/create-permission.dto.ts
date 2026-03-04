import { IsString, Matches, MinLength } from 'class-validator';

export class CreatePermissionDto {
  // Convention snake_case : ex. "read:announcements"
  @IsString()
  @MinLength(3)
  @Matches(/^[a-z0-9_:]+$/, { message: 'Valeur invalide : minuscules, chiffres, _ et : uniquement' })
  value!: string;
}
