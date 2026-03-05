import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { TagService } from './tag.service';

@Controller('tag')
@UseGuards(AuthenticatedGuard, AdminGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  listTags() {
    return this.tagService.listTags();
  }

  @Post()
  createTag(@Body('name') name: string) {
    return this.tagService.createTag(name);
  }

  @Delete(':id')
  deleteTag(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.tagService.deleteTag(id);
  }
}
