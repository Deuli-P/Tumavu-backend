import { IsInt, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class RecordPassageDto {
  @IsString()
  @IsUUID()
  userId!: string;

  @IsInt()
  @IsPositive()
  companyId!: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  jobId?: number;
}
