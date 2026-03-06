import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class JobCategoryService {
  constructor(private readonly databaseService: DatabaseService) {}

  findAll() {
    return this.databaseService.jobCategory.findMany({
      where: { deleted: false },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });
  }

  create(name: string, slug: string) {
    return this.databaseService.jobCategory.create({
      data: { name, slug },
      select: { id: true, name: true, slug: true },
    });
  }
}
