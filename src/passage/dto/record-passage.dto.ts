import { IsInt, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class RecordPassageDto {
  @IsString()
  @IsUUID()
  userId!: string;

}
