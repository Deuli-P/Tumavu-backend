import { IsOptional, IsString, IsUrl } from 'class-validator';

export class ApplyJobOfferDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsUrl()
  resumeUrl?: string;
}
