import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { ContractOfferType, HousingType, ScheduleType, SalaryType } from '@prisma/client';

export class CreateJobOfferDto {
  @IsInt()
  @IsPositive()
  jobId!: number;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsBoolean()
  flexibleDates?: boolean;

  @IsOptional()
  @IsNumber()
  hoursPerWeek?: number;

  @IsOptional()
  @IsEnum(ScheduleType)
  schedule?: ScheduleType;

  @IsOptional()
  @IsInt()
  @IsPositive()
  addressId?: number;

  @IsOptional()
  @IsEnum(SalaryType)
  salaryType?: SalaryType;

  @IsOptional()
  @IsNumber()
  salaryMin?: number;

  @IsOptional()
  @IsNumber()
  salaryMax?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(HousingType)
  housingProvided?: HousingType;

  @IsOptional()
  @IsNumber()
  housingCost?: number;

  @IsOptional()
  @IsString()
  housingDescription?: string;

  @IsOptional()
  @IsBoolean()
  mealsProvided?: boolean;

  @IsOptional()
  @IsBoolean()
  transportHelp?: boolean;

  @IsOptional()
  @IsBoolean()
  tips?: boolean;

  @IsOptional()
  @IsBoolean()
  bonus?: boolean;

  @IsOptional()
  @IsEnum(ContractOfferType)
  contractType?: ContractOfferType;

  @IsOptional()
  @IsDateString()
  applicationDeadline?: string;

  @IsOptional()
  @IsBoolean()
  nearTrainStation?: boolean;
}
