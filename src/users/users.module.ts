import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserController } from './user.controller';
import { UserSetupController } from './user-setup.controller';

@Module({
  imports: [AuthModule],
  controllers: [UsersController, UserController, UserSetupController],
  providers: [UsersService],
})
export class UsersModule {}
