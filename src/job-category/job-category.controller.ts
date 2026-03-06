import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JobCategoryService } from './job-category.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { IsString, MinLength } from 'class-validator';

class CreateJobCategoryDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  slug!: string;
}

@Controller('job-categories')
export class JobCategoryController {
  constructor(private readonly jobCategoryService: JobCategoryService) {}

  @Get()
  findAll() {
    return this.jobCategoryService.findAll();
  }

  @Post()
  @UseGuards(AuthenticatedGuard, AdminGuard)
  create(@Body() dto: CreateJobCategoryDto) {
    return this.jobCategoryService.create(dto.name, dto.slug);
  }
}
