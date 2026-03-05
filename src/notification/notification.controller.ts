import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Sse,
  OnModuleDestroy,
  Req,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { NotificationService } from './notification.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/auth-user.interface';
import { RegisterExpoTokenDto } from './dto/register-expo-token.dto';
import type { Request } from 'express';

@Controller('notifications')
@UseGuards(AuthenticatedGuard)
export class NotificationController implements OnModuleDestroy {
  constructor(private readonly notificationService: NotificationService) {}

  onModuleDestroy() {}

  // SSE — flux temps réel pour le web
  @Sse('stream')
  stream(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Req() req: Request,
  ): Observable<MessageEvent> {
    const subject = this.notificationService.getStream(user.userId);

    req.on('close', () => {
      this.notificationService.closeStream(user.userId);
    });

    return subject.asObservable();
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.notificationService.findAllForUser(user.userId);
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.notificationService.getUnreadCount(user.userId);
  }

  @Post(':id/read')
  markRead(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationService.markRead(user.userId, id);
  }

  @Post('read-all')
  markAllRead(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.notificationService.markAllRead(user.userId);
  }

  // Expo push token — enregistrement depuis le mobile
  @Post('expo-token')
  registerToken(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: RegisterExpoTokenDto,
  ) {
    return this.notificationService.registerToken(user.userId, dto.token, dto.deviceId);
  }

  @Delete('expo-token/:token')
  removeToken(@Param('token') token: string) {
    return this.notificationService.removeToken(token);
  }
}
