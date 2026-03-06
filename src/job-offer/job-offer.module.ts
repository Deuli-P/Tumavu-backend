import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { NotificationModule } from '../notification/notification.module';
import { JobOfferService } from './job-offer.service';
import { JobOfferController } from './job-offer.controller';

@Module({
  imports: [AuthModule, DatabaseModule, NotificationModule],
  controllers: [JobOfferController],
  providers: [JobOfferService],
  exports: [JobOfferService],
})
export class JobOfferModule {}
