import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AnnouncementStatus } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { CreateAnnonceDto } from './dto/create-annonce.dto';
import { UpdateAnnonceDto } from './dto/update-annonce.dto';

const ANNONCE_SELECT = {
  id: true,
  title: true,
  description: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  creator: {
    select: { id: true, firstName: true, lastName: true },
  },
  attachments: {
    select: {
      attachment: {
        select: { id: true, filename: true, url: true, mimeType: true, size: true },
      },
    },
  },
} as const;

@Injectable()
export class AnnonceService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(userId: string, dto: CreateAnnonceDto) {
    const attachmentCreates = (dto.attachments ?? []).map((a) => ({
      attachment: {
        create: {
          filename: a.filename,
          url: a.url,
          mimeType: a.mimeType,
          size: a.size,
        },
      },
    }));

    return this.databaseService.announcement.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status ?? AnnouncementStatus.DRAFT,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
        createdBy: userId,
        attachments: { create: attachmentCreates },
      },
      select: ANNONCE_SELECT,
    });
  }

  async update(userId: string, id: number, dto: UpdateAnnonceDto) {
    await this.checkOwnership(userId, id);

    if (dto.attachments !== undefined) {
      await this.databaseService.announcementAttachment.deleteMany({
        where: { announcementId: id },
      });
    }

    const attachmentCreates = (dto.attachments ?? []).map((a) => ({
      attachment: {
        create: {
          filename: a.filename,
          url: a.url,
          mimeType: a.mimeType,
          size: a.size,
        },
      },
    }));

    return this.databaseService.announcement.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.publishedAt !== undefined && {
          publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
        }),
        ...(dto.attachments !== undefined && {
          attachments: { create: attachmentCreates },
        }),
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

  findAll(status?: AnnouncementStatus) {
    return this.databaseService.announcement.findMany({
      where: {
        deleted: false,
        ...(status ? { status } : {}),
      },
      select: ANNONCE_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  private async checkOwnership(userId: string, id: number): Promise<void> {
    const annonce = await this.databaseService.announcement.findFirst({
      where: { id, deleted: false },
      select: { createdBy: true },
    });

    if (!annonce) throw new NotFoundException('Annonce introuvable');
    if (annonce.createdBy !== userId) throw new ForbiddenException('Non autorisé');
  }
}
