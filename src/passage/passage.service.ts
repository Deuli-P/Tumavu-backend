import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RecordPassageDto } from './dto/record-passage.dto';

const PASSAGE_SELECT = {
  id: true,
  createdAt: true,
  countPassageThisDay: true,
  lastPassageThisDay: true,
  userId: true,
  companyId: true,
} as const;

@Injectable()
export class PassageService {
  constructor(private readonly databaseService: DatabaseService) {}

  async record(scannerUserId: string, dto: RecordPassageDto) {
    const scannerUser = await this.databaseService.user.findFirst({
      where: { id: scannerUserId, deleted: false },
      select: {
        id: true,
        companies: {
          where: { deleted: false },
          select: {
            id: true,
            name: true,
            defaultOptions: { select: { maximumPassagePerDay: true } },
            address: { select: { locality: true } },
          },
          take: 1,
        },
      },
    });

    if (!scannerUser) {
      throw new NotFoundException('Utilisateur scanner introuvable');
    }

    const scannerCompany = scannerUser.companies[0] ?? null;
    if (!scannerCompany) {
      throw new BadRequestException("L'utilisateur scanner n'est rattache a aucune entreprise");
    }

    const scannedUser = await this.databaseService.user.findFirst({
      where: { id: dto.userId, deleted: false },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        photoPath: true,
        companies: {
          where: { deleted: false },
          select: {
            id: true,
            name: true,
            address: { select: { locality: true } },
          },
          take: 1,
        },
      },
    });

    if (!scannedUser) {
      throw new NotFoundException('Utilisateur scanne introuvable');
    }

    const scannedCompany = scannedUser.companies[0] ?? null;
    if (!scannedCompany) {
      throw new BadRequestException("L'utilisateur scanne n'est rattache a aucune entreprise");
    }

    const scannerLocality = scannerCompany.address.locality.trim().toLowerCase();
    const scannedLocality = scannedCompany.address.locality.trim().toLowerCase();

    if (scannerLocality !== scannedLocality) {
      throw new ConflictException('Les entreprises ne sont pas dans la meme ville');
    }

    const maxPassages = scannerCompany.defaultOptions?.maximumPassagePerDay ?? 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.databaseService.passage.findUnique({
      where: {
        userId_companyId_createdAt: {
          userId: dto.userId,
          companyId: scannerCompany.id,
          createdAt: today,
        },
      },
      select: { countPassageThisDay: true },
    });

    if (existing && existing.countPassageThisDay >= maxPassages) {
      throw new ConflictException(
        `Nombre maximum de passages atteint pour aujourd'hui (${maxPassages}/${maxPassages})`,
      );
    }

    const now = new Date();

    return this.databaseService.passage.upsert({
      where: {
        userId_companyId_createdAt: {
          userId: dto.userId,
          companyId: scannerCompany.id,
          createdAt: today,
        },
      },
      update: {
        countPassageThisDay: { increment: 1 },
        lastPassageThisDay: now,
      },
      create: {
        userId: dto.userId,
        companyId: scannerCompany.id,
        createdAt: today,
        countPassageThisDay: 1,
        lastPassageThisDay: now,
      },
      select: {
        ...PASSAGE_SELECT,
        user: {
          select: {
            photoPath: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }).then((passage) => {
      return {
        id: passage.id,
        createdAt: passage.createdAt,
        countPassageThisDay: passage.countPassageThisDay,
        lastPassageThisDay: passage.lastPassageThisDay,
        userId: passage.userId,
        companyId: passage.companyId,
        scannedUser: {
          photo: passage.user.photoPath,
          firstName: passage.user.firstName,
          lastName: passage.user.lastName,
          companyName: scannedCompany.name,
        },
      };
    });
  }

  findAll(filters: { companyId?: string; userId?: string; date?: string }) {
    const dateFilter = filters.date ? new Date(filters.date) : undefined;

    return this.databaseService.passage.findMany({
      where: {
        ...(filters.companyId ? { companyId: filters.companyId } : {}),
        ...(filters.userId ? { userId: filters.userId } : {}),
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      select: PASSAGE_SELECT,
      orderBy: { lastPassageThisDay: 'desc' },
    });
  }

  async findByUserForOwner(companyOwnerId: string, targetUserId: string) {
    const company = await this.databaseService.company.findFirst({
      where: { ownerId: companyOwnerId, deleted: false },
      select: { id: true },
    });

    if (!company) throw new NotFoundException('Entreprise introuvable');

    return this.databaseService.passage.findMany({
      where: { companyId: company.id, userId: targetUserId },
      select: PASSAGE_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }
}
