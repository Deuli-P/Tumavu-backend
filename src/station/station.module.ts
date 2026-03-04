import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { StationService } from './station.service';
import { StationController } from './station.controller';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [StationController],
  providers: [StationService],
})
export class StationModule {}
