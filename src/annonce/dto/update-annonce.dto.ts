import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { AnnouncementStatus } from '@prisma/client';

export class UpdateAnnonceDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @IsEnum(AnnouncementStatus)
  status?: AnnouncementStatus;
}
