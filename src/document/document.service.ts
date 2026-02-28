import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DocumentStatus } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { SupabaseStorageService } from '../storage/supabase-storage.service';

// Magic bytes d'un fichier PDF : %PDF-
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]);

const DOCUMENT_SELECT = {
  id: true,
  slug: true,
  status: true,
  createdAt: true,
  userId: true,
} as const;

@Injectable()
export class DocumentService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  async create(userId: string, file: Express.Multer.File) {
    this.validatePdf(file);

    const storagePath = `${userId}/cv/cv_${Date.now()}.pdf`;

    await this.storageService.uploadFile(storagePath, file.buffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

    return this.databaseService.document.create({
      data: {
        slug: storagePath,
        status: DocumentStatus.ACTIVE,
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

  async replace(userId: string, id: number, file: Express.Multer.File) {
    await this.checkOwnership(userId, id);
    this.validatePdf(file);

    const storagePath = `${userId}/cv/cv_${Date.now()}.pdf`;

    await this.storageService.uploadFile(storagePath, file.buffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

    // Archive l'ancien + crée le nouveau dans une transaction.
    const [, created] = await this.databaseService.$transaction([
      this.databaseService.document.update({
        where: { id },
        data: { deleted: true, status: DocumentStatus.ARCHIVED },
      }),
      this.databaseService.document.create({
        data: {
          slug: storagePath,
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

  // Vérifie mimetype + magic bytes pour s'assurer que c'est un vrai PDF.
  private validatePdf(file: Express.Multer.File): void {
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Le fichier doit etre un PDF');
    }

    const header = file.buffer.subarray(0, 5);
    if (!header.equals(PDF_MAGIC)) {
      throw new BadRequestException('Le fichier n\'est pas un PDF valide');
    }
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
