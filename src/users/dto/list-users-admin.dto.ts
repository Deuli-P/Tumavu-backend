import { Transform } from 'class-transformer';
import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class ListUsersAdminDto {
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : []))
  @IsString({ each: true })
  countries?: string[];

  @IsOptional()
  @IsIn(['all', 'owner', 'user'])
  hasRole?: 'all' | 'owner' | 'user';

  @IsOptional()
  @IsDateString()
  lastLoginFrom?: string;

  @IsOptional()
  @IsDateString()
  lastLoginTo?: string;
}
