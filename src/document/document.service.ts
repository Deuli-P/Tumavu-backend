import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DocumentStatus } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ReplaceDocumentDto } from './dto/replace-document.dto';

const DOCUMENT_SELECT = {
  id: true,
  slug: true,
  status: true,
  createdAt: true,
  userId: true,
} as const;

@Injectable()
export class DocumentService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(userId: string, dto: CreateDocumentDto) {
    return this.databaseService.document.create({
      data: {
        slug: dto.slug,
        status: dto.status ?? DocumentStatus.ACTIVE,
        userId,
      },
      select: DOCUMENT_SELECT,
    });
  }

  findAll(userId: string) {
    return this.databaseService.document.findMany({
      where: { userId, deleted: false },
      select: DOCUMENT_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: number) {
    const doc = await this.databaseService.document.findFirst({
      where: { id, userId, deleted: false },
      select: DOCUMENT_SELECT,
    });

    if (!doc) throw new NotFoundException('Document introuvable');
    return doc;
  }

  async replace(userId: string, id: number, dto: ReplaceDocumentDto) {
    await this.checkOwnership(userId, id);

    // Suppression douce de l'ancien + création du nouveau dans une transaction.
    const [, created] = await this.databaseService.$transaction([
      this.databaseService.document.update({
        where: { id },
        data: { deleted: true, status: DocumentStatus.ARCHIVED },
      }),
      this.databaseService.document.create({
        data: {
          slug: dto.slug,
          status: DocumentStatus.ACTIVE,
          userId,
        },
        select: DOCUMENT_SELECT,
      }),
    ]);

    return created;
  }

  async remove(userId: string, id: number): Promise<void> {
    await this.checkOwnership(userId, id);

    await this.databaseService.document.update({
      where: { id },
      data: { deleted: true, status: DocumentStatus.ARCHIVED },
    });
  }

  private async checkOwnership(userId: string, id: number): Promise<void> {
    const doc = await this.databaseService.document.findFirst({
      where: { id, deleted: false },
      select: { userId: true },
    });

    if (!doc) throw new NotFoundException('Document introuvable');
    if (doc.userId !== userId) throw new ForbiddenException('Non autorise');
  }
}
