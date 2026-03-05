import { IsEnum } from 'class-validator';
import { ApplicationAnnouncementStatus } from '@prisma/client';

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationAnnouncementStatus)
  status!: ApplicationAnnouncementStatus;
}
