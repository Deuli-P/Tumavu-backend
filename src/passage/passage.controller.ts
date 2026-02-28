import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/auth-user.interface';
import { PassageService } from './passage.service';
import { RecordPassageDto } from './dto/record-passage.dto';

@Controller('passage')
@UseGuards(AuthenticatedGuard)
export class PassageController {
  constructor(private readonly passageService: PassageService) {}

  // Appelé quand le scanner de la company scanne le QR code d'un user.
  @Post()
  record(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: RecordPassageDto,
  ) {
    return this.passageService.record(user.userId, dto);
  }

  @Get()
  findAll(
    @Query('companyId') companyId?: string,
    @Query('userId') userId?: string,
    @Query('date') date?: string,
  ) {
    return this.passageService.findAll({ companyId, userId, date });
  }

  // Retourne tous les passages d'un convoyeur dans la company du user connecté.
  @Get(':userId')
  findByUser(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('userId') targetUserId: string,
  ) {
    return this.passageService.findByUserForOwner(user.userId, targetUserId);
  }
}
