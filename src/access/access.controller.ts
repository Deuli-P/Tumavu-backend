import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/auth-user.interface';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CompanyOwnerGuard } from '../auth/guards/company-owner.guard';
import { GuestOnlyGuard } from '../auth/guards/guest-only.guard';
import { NonOwnerGuard } from '../auth/guards/non-owner.guard';

// Endpoints de demonstration pour tester les guards d'acces.
@Controller('access')
export class AccessController {
  @UseGuards(GuestOnlyGuard)
  @Get('guest')
  guestOnly() {
    return {
      rule: 'guest-only',
      message: 'Acces autorise: utilisateur non connecte',
    };
  }

  @UseGuards(AuthenticatedGuard, NonOwnerGuard)
  @Get('member')
  connectedNonOwner(@CurrentUser() user: AuthenticatedRequestUser) {
    return {
      rule: 'authenticated-non-owner',
      message: 'Acces autorise: user connecte et non owner',
      user,
    };
  }

  @UseGuards(AuthenticatedGuard, CompanyOwnerGuard)
  @Get('owner')
  connectedOwner(@CurrentUser() user: AuthenticatedRequestUser) {
    return {
      rule: 'authenticated-company-owner',
      message: 'Acces autorise: user connecte owner',
      user,
    };
  }

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Get('admin')
  connectedAdmin(@CurrentUser() user: AuthenticatedRequestUser) {
    return {
      rule: 'authenticated-admin',
      message: 'Acces autorise: user connecte admin',
      user,
    };
  }
}
