import { IsInt, IsPositive } from 'class-validator';

export class UpdateLanguageDto {
  @IsInt()
  @IsPositive()
  language!: number;
}
