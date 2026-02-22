import { Module } from '@nestjs/common';
import { AccessController } from './access.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AccessController],
})
export class AccessModule {}
