import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { GuestOnlyGuard } from './guards/guest-only.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { NonOwnerGuard } from './guards/non-owner.guard';
import { CompanyOwnerGuard } from './guards/company-owner.guard';
import { AdminGuard } from './guards/admin.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    GuestOnlyGuard,
    AuthenticatedGuard,
    NonOwnerGuard,
    CompanyOwnerGuard,
    AdminGuard,
  ],
  exports: [
    TokenService,
    GuestOnlyGuard,
    AuthenticatedGuard,
    NonOwnerGuard,
    CompanyOwnerGuard,
    AdminGuard,
  ],
})
export class AuthModule {}
