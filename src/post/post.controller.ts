import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/auth-user.interface';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';

const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10 Mo
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

const photosInterceptor = FilesInterceptor('files', 5, {
  storage: memoryStorage(),
  limits: { fileSize: MAX_PHOTO_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      return cb(new BadRequestException('Format accepté : JPG, PNG, WebP, HEIC'), false);
    }
    cb(null, true);
  },
});

@Controller('post')
@UseGuards(AuthenticatedGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: CreatePostDto) {
    return this.postService.create(user.userId, dto);
  }

  @Post(':id/photos')
  @UseInterceptors(photosInterceptor)
  addPhotos(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) throw new BadRequestException('Aucune photo fournie');
    return this.postService.addPhotos(user.userId, id, files);
  }

  @Get('feed')
  getFeed(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.postService.getFeed(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseIntPipe) id: number) {
    return this.postService.findOne(user.userId, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseIntPipe) id: number) {
    return this.postService.remove(user.userId, id);
  }
}
