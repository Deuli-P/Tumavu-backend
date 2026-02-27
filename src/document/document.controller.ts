import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/auth-user.interface';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ReplaceDocumentDto } from './dto/replace-document.dto';

@Controller('document')
@UseGuards(AuthenticatedGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documentService.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.documentService.findAll(user.userId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.documentService.findOne(user.userId, id);
  }

  // Remplace l'ancien document (soft delete) et crée le nouveau.
  @Put(':id')
  replace(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReplaceDocumentDto,
  ) {
    return this.documentService.replace(user.userId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.documentService.remove(user.userId, id);
  }
}
