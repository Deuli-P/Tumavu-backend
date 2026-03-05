import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/auth-user.interface';
import { AnnonceService } from './annonce.service';
import { CreateAnnonceDto } from './dto/create-annonce.dto';
import { UpdateAnnonceDto } from './dto/update-annonce.dto';
import { AssignAnnonceDto } from './dto/assign-annonce.dto';
import { ListAnnonceAdminDto } from './dto/list-annonce-admin.dto';

@Controller('annonce')
@UseGuards(AuthenticatedGuard)
export class AnnonceController {
  constructor(private readonly annonceService: AnnonceService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: CreateAnnonceDto,
  ) {
    return this.annonceService.create(user.userId, dto);
  }

  @Get('admin')
  @UseGuards(AdminGuard)
  listAdmin(@Query() dto: ListAnnonceAdminDto) {
    return this.annonceService.listAdmin(dto);
  }

  @Get('admin/tags')
  @UseGuards(AdminGuard)
  listAdminTags() {
    return this.annonceService.listAdminTags();
  }

  @Get('admin/applications')
  @UseGuards(AdminGuard)
  listApplicationsAdmin(
    @Query('status') status?: string,
    @Query('companyId') companyId?: string,
    @Query('stationId') stationId?: string,
  ) {
    return this.annonceService.listApplicationsAdmin({
      status,
      companyId,
      stationId: stationId ? Number(stationId) : undefined,
    });
  }

  @Get('admin/:id')
  @UseGuards(AdminGuard)
  findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.annonceService.findOneAdmin(id);
  }

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.annonceService.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.annonceService.findOne(id);
  }

  @Put(':id')
  update(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAnnonceDto,
  ) {
    return this.annonceService.update(user.userId, id, dto);
  }

  @Put(':id/assign')
  assign(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignAnnonceDto,
  ): Promise<void> {
    return this.annonceService.assign(user.userId, id, dto.userId);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.annonceService.remove(user.userId, id);
  }
}
