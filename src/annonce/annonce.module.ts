import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { AnnonceService } from './annonce.service';
import { AnnonceController } from './annonce.controller';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [AnnonceController],
  providers: [AnnonceService],
})
export class AnnonceModule {}
