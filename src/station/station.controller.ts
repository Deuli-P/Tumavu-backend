import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { StationService, StationPayload, StationDetail } from './station.service';
import { CreateStationDto } from './dto/create-station.dto';

@Controller('station')
export class StationController {
  constructor(private readonly stationService: StationService) {}

  @Post()
  @UseGuards(AuthenticatedGuard, AdminGuard)
  createStation(@Body() dto: CreateStationDto): Promise<StationPayload> {
    return this.stationService.createStation(dto);
  }

  @Get()
  @UseGuards(AuthenticatedGuard)
  listStations(): Promise<StationPayload[]> {
    return this.stationService.listStations();
  }

  @Get(':id')
  @UseGuards(AuthenticatedGuard, AdminGuard)
  findOneAdmin(@Param('id', ParseIntPipe) id: number): Promise<StationDetail> {
    return this.stationService.findOneAdmin(id);
  }
}
