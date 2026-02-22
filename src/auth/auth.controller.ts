import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthPayload, AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedRequestUser } from './auth-user.interface';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { GuestOnlyGuard } from './guards/guest-only.guard';

const PROFILE_PHOTOS_DIR = 'uploads/profile-photos';
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
type UploadedPhoto = { filename: string };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Route reservee aux non connectes.
  @UseGuards(GuestOnlyGuard)
  @Post('register')
  @UseInterceptors(
    FileInterceptor('photo', {
      dest: PROFILE_PHOTOS_DIR,
      limits: { fileSize: MAX_PHOTO_SIZE_BYTES },
      fileFilter: (
        _request: unknown,
        file: { mimetype: string },
        callback: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(new BadRequestException('Le fichier doit etre une image'), false);
        }
        callback(null, true);
      },
    }),
  )
  register(
    @Body() dto: RegisterDto,
    @UploadedFile() photo?: UploadedPhoto,
  ): Promise<AuthPayload> {
    if (photo) {
      dto.photoPath = `/uploads/profile-photos/${photo.filename}`;
    }
    return this.authService.register(dto);
  }

  // Route reservee aux non connectes.
  @UseGuards(GuestOnlyGuard)
  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthPayload> {
    return this.authService.login(dto);
  }

  // Route reservee aux connectes.
  @UseGuards(AuthenticatedGuard)
  @Get('me')
  me(@CurrentUser() user: AuthenticatedRequestUser) {
    return user;
  }
}
