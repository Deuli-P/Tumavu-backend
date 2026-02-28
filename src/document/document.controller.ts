import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/auth-user.interface';
import { DocumentService } from './document.service';

const MAX_CV_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo

const pdfInterceptor = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: MAX_CV_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== 'application/pdf') {
      return callback(new BadRequestException('Le fichier doit etre un PDF'), false);
    }
    callback(null, true);
  },
});

@Controller('document')
@UseGuards(AuthenticatedGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @UseInterceptors(pdfInterceptor)
  create(
    @CurrentUser() user: AuthenticatedRequestUser,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Fichier PDF requis');
    return this.documentService.create(user.userId, file);
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

  // Remplace l'ancien CV (soft delete) et crée le nouveau.
  @Put(':id')
  @UseInterceptors(pdfInterceptor)
  replace(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Fichier PDF requis');
    return this.documentService.replace(user.userId, id, file);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.documentService.remove(user.userId, id);
  }
}
