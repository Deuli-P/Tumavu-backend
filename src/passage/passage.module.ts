import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { PassageService } from './passage.service';
import { PassageController } from './passage.controller';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [PassageController],
  providers: [PassageService],
})
export class PassageModule {}
