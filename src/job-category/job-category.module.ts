import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { JobCategoryService } from './job-category.service';
import { JobCategoryController } from './job-category.controller';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [JobCategoryController],
  providers: [JobCategoryService],
  exports: [JobCategoryService],
})
export class JobCategoryModule {}
