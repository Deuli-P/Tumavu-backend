import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { KeepaliveService } from './keepalive.service';
import { KeepaliveController } from './keepalive.controller';

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule, AuthModule],
  controllers: [KeepaliveController],
  providers: [KeepaliveService],
})
export class KeepaliveModule {}
