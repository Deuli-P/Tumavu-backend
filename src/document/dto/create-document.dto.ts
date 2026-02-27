import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { DocumentStatus } from '@prisma/client';

export class CreateDocumentDto {
  @IsString()
  @MinLength(1)
  slug!: string;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;
}
