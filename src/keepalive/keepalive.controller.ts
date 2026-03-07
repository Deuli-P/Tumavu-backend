import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { KeepaliveService } from './keepalive.service';

@Controller('keepalive')
@UseGuards(AuthenticatedGuard, AdminGuard)
export class KeepaliveController {
  constructor(private readonly keepaliveService: KeepaliveService) {}

  @Get('ping')
  async ping() {
    await this.keepaliveService.ping();
    return { ok: true };
  }
}
