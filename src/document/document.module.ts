import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
