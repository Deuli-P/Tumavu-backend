import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [PermissionController],
  providers: [PermissionService],
})
export class PermissionModule {}
