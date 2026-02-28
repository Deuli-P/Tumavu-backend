import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpsertOptionsDto } from './dto/upsert-options.dto';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';

export type CompanyPayload = {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  type: string | null;
  address: {
    street: string;
    number: string | null;
    locality: string;
    country: { name: string; code: string };
  };
  owner: {
    id: string;
  };
};

@Injectable()
export class CompanyService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createCompany(ownerId: string, dto: CreateCompanyDto): Promise<CompanyPayload> {
    const company = await this.databaseService.company.create({
      data: {
        name: dto.name,
        description: dto.description,
        phone: dto.phone,
        type: dto.type,
        owner: { connect: { id: ownerId } },
        address: {
          create: {
            street: dto.address.street,
            number: dto.address.number,
            locality: dto.address.locality,
            country: { connect: { id: dto.address.countryId } },
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        phone: true,
        type: true,
        ownerId: true,
        address: {
          select: {
            street: true,
            number: true,
            locality: true,
            country: { select: { name: true, code: true } },
          },
        },
      },
    });

    return {
      id: company.id,
      name: company.name,
      description: company.description,
      phone: company.phone,
      type: company.type,
      address: {
        street: company.address.street,
        number: company.address.number,
        locality: company.address.locality,
        country: company.address.country,
      },
      owner: {
        id: company.ownerId,
      },
    };
  }

  // ─── Vérification ownership ───────────────────────────────────────────────

  private async checkOwnership(userId: string, companyId: string): Promise<void> {
    const company = await this.databaseService.company.findFirst({
      where: { id: companyId, deleted: false },
      select: { ownerId: true },
    });
    if (!company) throw new NotFoundException('Entreprise introuvable');
    if (company.ownerId !== userId) throw new ForbiddenException('Non autorise');
  }

  // ─── Options ──────────────────────────────────────────────────────────────

  async upsertOptions(userId: string, companyId: string, dto: UpsertOptionsDto) {
    await this.checkOwnership(userId, companyId);

    return this.databaseService.companyDefaultOptions.upsert({
      where: { companyId },
      update: { maximumPassagePerDay: dto.maximumPassagePerDay },
      create: { companyId, maximumPassagePerDay: dto.maximumPassagePerDay },
      select: { id: true, companyId: true, maximumPassagePerDay: true },
    });
  }

  async getOptions(companyId: string) {
    return this.databaseService.companyDefaultOptions.findUnique({
      where: { companyId },
      select: { id: true, companyId: true, maximumPassagePerDay: true },
    });
  }

  // ─── Avantages ────────────────────────────────────────────────────────────

  async createBenefit(userId: string, companyId: string, dto: CreateBenefitDto) {
    await this.checkOwnership(userId, companyId);

    return this.databaseService.benefit.create({
      data: {
        companyId,
        name: dto.name,
        description: dto.description,
        quantity: dto.quantity,
        duration: dto.duration,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      },
      select: {
        id: true,
        name: true,
        description: true,
        quantity: true,
        duration: true,
        startDate: true,
        companyId: true,
      },
    });
  }

  getBenefits(companyId: string) {
    return this.databaseService.benefit.findMany({
      where: { companyId, deleted: false },
      select: {
        id: true,
        name: true,
        description: true,
        quantity: true,
        duration: true,
        startDate: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateBenefit(userId: string, companyId: string, benefitId: number, dto: UpdateBenefitDto) {
    await this.checkOwnership(userId, companyId);

    return this.databaseService.benefit.update({
      where: { id: benefitId },
      data: {
        name: dto.name,
        description: dto.description,
        quantity: dto.quantity,
        duration: dto.duration,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      },
      select: {
        id: true,
        name: true,
        description: true,
        quantity: true,
        duration: true,
        startDate: true,
        companyId: true,
      },
    });
  }

  async deleteBenefit(userId: string, companyId: string, benefitId: number): Promise<void> {
    await this.checkOwnership(userId, companyId);

    await this.databaseService.benefit.update({
      where: { id: benefitId },
      data: { deleted: true },
    });
  }
}
