import {
  ConflictException,
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
  startDate: true,
  endDate: true,
  createdAt: true,
  createdBy: true,
  tags: { select: { id: true, name: true } },
  company: {
    select: {
      id: true,
      description: true,
      phone: true,
      type: true,
      address: {
        select: {
          city: true,
          country: true,
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

    return this.databaseService.job.create({
      data: {
        title: dto.title,
        description: dto.description,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        createdBy: userId,
        companyId: dto.companyId,
        tags: dto.tagIds?.length ? { connect: dto.tagIds.map((id) => ({ id })) } : undefined,
      },
      select: ANNONCE_SELECT,
    });
  }

  async update(userId: string, id: number, dto: UpdateAnnonceDto) {
    await this.checkOwnership(userId, id);

    return this.databaseService.job.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        tags: dto.tagIds !== undefined ? { set: dto.tagIds.map((id) => ({ id })) } : undefined,
      },
      select: ANNONCE_SELECT,
    });
  }

  async remove(userId: string, id: number): Promise<void> {
    await this.checkOwnership(userId, id);

    await this.databaseService.job.update({
      where: { id },
      data: { deleted: true },
    });
  }

  findOne(id: number) {
    return this.databaseService.job.findFirst({
      where: { id, deleted: false },
      select: ANNONCE_SELECT,
    });
  }

  findAll(companyId?: number) {
    return this.databaseService.job.findMany({
      where: {
        deleted: false,
        ...(companyId ? { companyId } : {}),
      },
      select: ANNONCE_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async assign(creatorId: string, jobId: number, targetUserId: string): Promise<void> {
    // Vérifie que l'annonce existe et appartient au créateur.
    await this.checkOwnership(creatorId, jobId);

    // Vérifie que le job n'a pas déjà un employé.
    const jobWithEmployee = await this.databaseService.job.findFirst({
      where: { id: jobId, deleted: false },
      select: { employee: { select: { id: true } } },
    });

    if (jobWithEmployee?.employee) {
      throw new ConflictException('Ce job est deja attribue a un convoyeur');
    }

    // Vérifie que le user cible existe et n'a pas déjà un job.
    const targetUser = await this.databaseService.user.findFirst({
      where: { id: targetUserId, deleted: false },
      select: { id: true, jobId: true },
    });

    if (!targetUser) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (targetUser.jobId !== null) {
      throw new ConflictException('Ce convoyeur a deja un job en cours');
    }

    await this.databaseService.user.update({
      where: { id: targetUserId },
      data: { jobId },
    });
  }

  private async checkOwnership(userId: string, id: number): Promise<void> {
    const annonce = await this.databaseService.job.findFirst({
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
