import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateAnnonceDto } from './dto/create-annonce.dto';
import { UpdateAnnonceDto } from './dto/update-annonce.dto';

const ANNONCE_SELECT = {
  id: true,
  title: true,
  description: true,
  createdAt: true,
  createdBy: true,
} as const;

@Injectable()
export class AnnonceService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(userId: string, dto: CreateAnnonceDto) {
    return this.databaseService.announcement.create({
      data: {
        title: dto.title,
        description: dto.description,
        createdBy: userId,
      },
      select: ANNONCE_SELECT,
    });
  }

  async update(userId: string, id: number, dto: UpdateAnnonceDto) {
    await this.checkOwnership(userId, id);

    return this.databaseService.announcement.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
      },
      select: ANNONCE_SELECT,
    });
  }

  async remove(userId: string, id: number): Promise<void> {
    await this.checkOwnership(userId, id);

    await this.databaseService.announcement.update({
      where: { id },
      data: { deleted: true },
    });
  }

  findOne(id: number) {
    return this.databaseService.announcement.findFirst({
      where: { id, deleted: false },
      select: ANNONCE_SELECT,
    });
  }

  findAll() {
    return this.databaseService.announcement.findMany({
      where: { deleted: false },
      select: ANNONCE_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  private async checkOwnership(userId: string, id: number): Promise<void> {
    const annonce = await this.databaseService.announcement.findFirst({
      where: { id, deleted: false },
      select: { createdBy: true },
    });

    if (!annonce) {
      throw new NotFoundException('Annonce introuvable');
    }

    if (annonce.createdBy !== userId) {
      throw new ForbiddenException('Non autorise');
    }
  }
}
