import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

// Module NestJS qui regroupe la logique users.
@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
