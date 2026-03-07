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
import { AnnouncementStatus } from '@prisma/client';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/auth-user.interface';
import { AnnonceService } from './annonce.service';
import { CreateAnnonceDto } from './dto/create-annonce.dto';
import { UpdateAnnonceDto } from './dto/update-annonce.dto';

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

  @Get()
  findAll(@Query('status') status?: AnnouncementStatus) {
    return this.annonceService.findAll(status);
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

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.annonceService.remove(user.userId, id);
  }
}
