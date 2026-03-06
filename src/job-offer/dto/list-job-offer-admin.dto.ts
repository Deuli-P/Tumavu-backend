import { IsEnum, IsInt, IsOptional, IsPositive, IsUUID } from 'class-validator';
import { JobOfferStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class ListJobOfferAdminDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  stationId?: number;

  @IsOptional()
  @IsEnum(JobOfferStatus)
  status?: JobOfferStatus;
}
