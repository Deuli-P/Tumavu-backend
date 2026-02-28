import { IsEnum, IsInt, IsOptional, IsPositive, IsString, IsUUID, MinLength } from 'class-validator';
import { AnnouncementStatus } from '@prisma/client';

export class CreateAnnonceDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsUUID()
  companyId!: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  jobId?: number;

  @IsOptional()
  @IsEnum(AnnouncementStatus)
  status?: AnnouncementStatus;
}
