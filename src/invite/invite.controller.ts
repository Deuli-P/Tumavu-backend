import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { InviteService } from './invite.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/auth-user.interface';
import { CreateInviteDto } from './dto/create-invite.dto';

@Controller('invite')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  // Authentifié (manager) — crée l'invitation et envoie l'email
  @Post()
  @UseGuards(AuthenticatedGuard)
  create(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: CreateInviteDto,
  ) {
    return this.inviteService.create(user.userId, dto);
  }

  // Public — vérifie le token avant login/register
  @Get(':token')
  getByToken(@Param('token') token: string) {
    return this.inviteService.getByToken(token);
  }

  // Authentifié — appelé après login/register
  @Post(':token/accept')
  @HttpCode(200)
  @UseGuards(AuthenticatedGuard)
  accept(
    @Param('token') token: string,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.inviteService.accept(token, user.userId);
  }
}
