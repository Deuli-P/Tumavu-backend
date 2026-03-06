import { IsEnum } from 'class-validator';
import { ApplicationJobStatus } from '@prisma/client';

export class UpdateApplicationJobStatusDto {
  @IsEnum(ApplicationJobStatus)
  status!: ApplicationJobStatus;
}
