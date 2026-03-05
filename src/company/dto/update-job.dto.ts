import { IsArray, IsEnum, IsInt, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';
import { ContractType, JobStatus } from '@prisma/client';

export class UpdateJobDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  tagIds?: number[];
}
