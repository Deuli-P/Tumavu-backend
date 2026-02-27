import { IsInt, Min } from 'class-validator';

export class UpsertOptionsDto {
  @IsInt()
  @Min(1)
  maxPassagesPerDay!: number;
}
