import { IsString, MinLength } from 'class-validator';

export class UpdatePhotoDto {
  @IsString()
  @MinLength(1)
  slug!: string;
}
