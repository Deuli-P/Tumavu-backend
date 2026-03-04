import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { PasswordService } from '../auth/password.service';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [CompanyController],
  providers: [CompanyService, PasswordService],
})
export class CompanyModule {}
