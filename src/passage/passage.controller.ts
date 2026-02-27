import { Body, Controller, Get, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { PassageService } from './passage.service';
import { RecordPassageDto } from './dto/record-passage.dto';

@Controller('passage')
@UseGuards(AuthenticatedGuard)
export class PassageController {
  constructor(private readonly passageService: PassageService) {}

  // Appelé quand le scanner de la company scanne le QR code d'un user.
  @Post()
  record(@Body() dto: RecordPassageDto) {
    return this.passageService.record(dto);
  }

  @Get()
  findAll(
    @Query('companyId', new ParseIntPipe({ optional: true })) companyId?: number,
    @Query('userId') userId?: string,
    @Query('date') date?: string,
  ) {
    return this.passageService.findAll({ companyId, userId, date });
  }
}
