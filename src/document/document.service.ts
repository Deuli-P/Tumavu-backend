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

  // Upload d'un nouveau CV : archive l'ACTIVE existant (sans le supprimer — conservé
  // pour les candidatures passées), puis crée le nouveau comme ACTIVE.
  async create(userId: string, file: Express.Multer.File) {
    this.validatePdf(file);

    const filename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${userId}/cv/${Date.now()}_${filename}`;

    await this.storageService.uploadFile(storagePath, file.buffer, {
      contentType: 'application/pdf',
      upsert: false,
    });

    // Archive tous les CV ACTIVE existants de l'utilisateur (sans deleted: true).
    await this.databaseService.document.updateMany({
      where: { userId, status: DocumentStatus.ACTIVE, deleted: false },
      data: { status: DocumentStatus.ARCHIVED },
    });

    const doc = await this.databaseService.document.create({
      data: { slug: storagePath, status: DocumentStatus.ACTIVE, userId },
      select: DOCUMENT_SELECT,
    });

    return { ...doc, url: this.storageService.getPublicUrl(storagePath) };
  }

  // Retourne uniquement le CV actif de l'utilisateur (0 ou 1 résultat).
  async findAll(userId: string) {
    const docs = await this.databaseService.document.findMany({
      where: { userId, status: DocumentStatus.ACTIVE, deleted: false },
      select: DOCUMENT_SELECT,
      orderBy: { createdAt: 'desc' },
    });

    return docs.map((d) => ({ ...d, url: this.storageService.getPublicUrl(d.slug) }));
  }

  // Utilisé par le service candidature pour résoudre l'URL du CV joint.
  async findOne(userId: string, id: number) {
    const doc = await this.databaseService.document.findFirst({
      where: { id, userId, deleted: false },
      select: DOCUMENT_SELECT,
    });

    if (!doc) throw new NotFoundException('Document introuvable');
    return { ...doc, url: this.storageService.getPublicUrl(doc.slug) };
  }

  // Archive le CV (sans suppression) — il reste accessible pour les candidatures passées.
  async remove(userId: string, id: number): Promise<void> {
    await this.checkOwnership(userId, id);

    await this.databaseService.document.update({
      where: { id },
      data: { status: DocumentStatus.ARCHIVED },
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
      where: { id, deleted: false, userId },
      select: { userId: true },
    });

    if (!doc) throw new NotFoundException('Document introuvable');
    if (doc.userId !== userId) throw new ForbiddenException('Non autorise');
  }
}
