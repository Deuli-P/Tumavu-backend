import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/auth-user.interface';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('post')
@UseGuards(AuthenticatedGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: CreatePostDto) {
    return this.postService.create(user.userId, dto);
  }

  @Get('feed')
  getFeed(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.postService.getFeed(user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseIntPipe) id: number) {
    return this.postService.remove(user.userId, id);
  }
}
