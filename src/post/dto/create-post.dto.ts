import { IsEnum, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
import { PostVisibility } from '@prisma/client';

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsUrl()
  link?: string;

  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;
}
