import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationAnnouncementStatus } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { CreateAnnonceDto } from './dto/create-annonce.dto';
import { UpdateAnnonceDto } from './dto/update-annonce.dto';

const ANNONCE_SELECT = {
  id: true,
  title: true,
  description: true,
  status: true,
  createdAt: true,
  createdBy: true,
  jobId: true,
  company: {
    select: {
      id: true,
      name: true,
      phone: true,
      type: true,
      address: {
        select: {
          locality: true,
          country: { select: { name: true } },
        },
      },
    },
  },
} as const;

@Injectable()
export class AnnonceService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(userId: string, dto: CreateAnnonceDto) {
    const company = await this.databaseService.company.findFirst({
      where: { id: dto.companyId, ownerId: userId, deleted: false },
      select: { id: true },
    });

    if (!company) {
      throw new NotFoundException('Entreprise introuvable ou non autorisee');
    }

    return this.databaseService.announcement.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        createdBy: userId,
        companyId: dto.companyId,
        jobId: dto.jobId,
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
        status: dto.status,
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

  findAll(companyId?: string) {
    return this.databaseService.announcement.findMany({
      where: {
        deleted: false,
        ...(companyId ? { companyId } : {}),
      },
      select: ANNONCE_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async assign(creatorId: string, announcementId: number, targetUserId: string): Promise<void> {
    await this.checkOwnership(creatorId, announcementId);

    const targetUser = await this.databaseService.user.findFirst({
      where: { id: targetUserId, deleted: false },
      select: { id: true },
    });

    if (!targetUser) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const existingApplication = await this.databaseService.applicationAnnouncement.findFirst({
      where: { announcementId, userId: targetUserId, deleted: false },
      select: { id: true },
    });

    if (existingApplication) {
      const alreadyConfirmed = await this.databaseService.applicationAnnouncement.findFirst({
        where: { announcementId, status: ApplicationAnnouncementStatus.CONFIRMED, deleted: false },
        select: { id: true },
      });

      if (alreadyConfirmed && alreadyConfirmed.id !== existingApplication.id) {
        throw new ConflictException('Cette annonce a deja un candidat confirme');
      }

      await this.databaseService.applicationAnnouncement.update({
        where: { id: existingApplication.id },
        data: { status: ApplicationAnnouncementStatus.CONFIRMED, processedBy: creatorId, processedAt: new Date() },
      });
    } else {
      await this.databaseService.applicationAnnouncement.create({
        data: {
          announcementId,
          userId: targetUserId,
          status: ApplicationAnnouncementStatus.CONFIRMED,
          processedBy: creatorId,
          processedAt: new Date(),
        },
      });
    }
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
