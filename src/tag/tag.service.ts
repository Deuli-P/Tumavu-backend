import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TagService {
  constructor(private readonly databaseService: DatabaseService) {}

  listTags() {
    return this.databaseService.tag.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { jobs: { where: { deleted: false } } } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createTag(name: string) {
    const existing = await this.databaseService.tag.findFirst({
      where: { name: name.trim() },
      select: { id: true },
    });
    if (existing) throw new ConflictException('Ce tag existe déjà');

    return this.databaseService.tag.create({
      data: { name: name.trim() },
      select: { id: true, name: true },
    });
  }

  async deleteTag(id: number): Promise<void> {
    const tag = await this.databaseService.tag.findFirst({
      where: { id },
      select: { id: true },
    });
    if (!tag) throw new NotFoundException('Tag introuvable');

    await this.databaseService.tag.delete({ where: { id } });
  }
}
