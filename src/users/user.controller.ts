import {
  BadRequestException,
  Body,
  Controller,
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
import { UsersService } from './users.service';
import { UpdateContactDto } from './dto/update-contact.dto';

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo

@Controller('user')
@UseGuards(AuthenticatedGuard)
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Put('photo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_PHOTO_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(new BadRequestException('Le fichier doit etre une image'), false);
        }
        callback(null, true);
      },
    }),
  )
  updatePhoto(
    @CurrentUser() user: AuthenticatedRequestUser,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<{ publicUrl: string }> {
    if (!file) throw new BadRequestException('Fichier image requis');
    return this.usersService.updatePhoto(user.userId, file);
  }

  @Put('contact')
  updateContact(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: UpdateContactDto,
  ): Promise<void> {
    return this.usersService.updateContact(user.userId, dto);
  }
}
