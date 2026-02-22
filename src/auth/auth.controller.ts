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
import { memoryStorage } from 'multer';

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
type UploadedPhoto = {
  buffer: Buffer;
  mimetype: string;
  originalname?: string;
  size?: number;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Route reservee aux non connectes.
  @UseGuards(GuestOnlyGuard)
  @Post('register')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_PHOTO_SIZE_BYTES },
      fileFilter: (req, file, callback) => {
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
    return this.authService.register(dto, photo);
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
