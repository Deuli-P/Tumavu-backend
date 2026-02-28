import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RecordPassageDto } from './dto/record-passage.dto';

const PASSAGE_SELECT = {
  id: true,
  date: true,
  count: true,
  lastPassageAt: true,
  userId: true,
  companyId: true,
  jobId: true,
} as const;

@Injectable()
export class PassageService {
  constructor(private readonly databaseService: DatabaseService) {}

  async record(dto: RecordPassageDto) {
    // Vérifie que la company existe.
    const company = await this.databaseService.company.findFirst({
      where: { id: dto.companyId, deleted: false },
      select: {
        id: true,
        defaultOptions: { select: { maxPassagesPerDay: true } },
      },
    });

    if (!company) throw new NotFoundException('Entreprise introuvable');

    const maxPassages = company.defaultOptions?.maxPassagesPerDay ?? 1;

    // Date du jour sans heure (pour la contrainte unique par jour).
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Vérifie si le maximum du jour est atteint.
    const existing = await this.databaseService.userPassage.findUnique({
      where: {
        userId_companyId_date: {
          userId: dto.userId,
          companyId: dto.companyId,
          date: today,
        },
      },
      select: { count: true },
    });

    if (existing && existing.count >= maxPassages) {
      throw new ConflictException(
        `Nombre maximum de passages atteint pour aujourd'hui (${maxPassages}/${maxPassages})`,
      );
    }

    const now = new Date();

    return this.databaseService.userPassage.upsert({
      where: {
        userId_companyId_date: {
          userId: dto.userId,
          companyId: dto.companyId,
          date: today,
        },
      },
      update: {
        count: { increment: 1 },
        lastPassageAt: now,
      },
      create: {
        userId: dto.userId,
        companyId: dto.companyId,
        jobId: dto.jobId,
        date: today,
        count: 1,
        lastPassageAt: now,
      },
      select: PASSAGE_SELECT,
    });
  }

  findAll(filters: { companyId?: number; userId?: string; date?: string }) {
    const dateFilter = filters.date ? new Date(filters.date) : undefined;

    return this.databaseService.userPassage.findMany({
      where: {
        ...(filters.companyId ? { companyId: filters.companyId } : {}),
        ...(filters.userId ? { userId: filters.userId } : {}),
        ...(dateFilter ? { date: dateFilter } : {}),
      },
      select: PASSAGE_SELECT,
      orderBy: { lastPassageAt: 'desc' },
    });
  }

  async findByUserForOwner(companyOwnerId: string, targetUserId: string) {
    const company = await this.databaseService.company.findFirst({
      where: { ownerId: companyOwnerId, deleted: false },
      select: { id: true },
    });

    if (!company) throw new NotFoundException('Entreprise introuvable');

    return this.databaseService.userPassage.findMany({
      where: { companyId: company.id, userId: targetUserId },
      select: PASSAGE_SELECT,
      orderBy: { date: 'desc' },
    });
  }
}
