import { IsOptional, IsString } from 'class-validator';

export class RegisterExpoTokenDto {
  @IsString()
  token!: string;

  @IsOptional()
  @IsString()
  deviceId?: string;
}
