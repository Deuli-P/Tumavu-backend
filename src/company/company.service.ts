import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpsertOptionsDto } from './dto/upsert-options.dto';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';

export type CompanyPayload = {
  id: number;
  name: string;
  phone: string | null;
  type: string | null;
  address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
    formattedAddress: string;
  };
  owner: {
    id: string;
  };
};

@Injectable()
export class CompanyService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createCompany(ownerId: string, dto: CreateCompanyDto): Promise<CompanyPayload> {
    const formattedAddress = `${dto.address.street}, ${dto.address.zipCode} ${dto.address.city}, ${dto.address.country}`;

    const company = await this.databaseService.company.create({
      data: {
        description: dto.name,
        phone: dto.phone,
        type: dto.type,
        owner: { connect: { id: ownerId } },
        address: {
          create: {
            street: dto.address.street,
            city: dto.address.city,
            zipCode: dto.address.zipCode,
            country: dto.address.country,
            formatted_address: formattedAddress,
          },
        },
      },
      select: {
        id: true,
        description: true,
        phone: true,
        type: true,
        ownerId: true,
        address: {
          select: {
            street: true,
            city: true,
            zipCode: true,
            country: true,
            formatted_address: true,
          },
        },
      },
    });

    return {
      id: company.id,
      name: company.description ?? '',
      phone: company.phone,
      type: company.type,
      address: {
        street: company.address.street,
        city: company.address.city,
        zipCode: company.address.zipCode,
        country: company.address.country,
        formattedAddress: company.address.formatted_address,
      },
      owner: {
        id: company.ownerId,
      },
    };
  }

  // ─── Vérification ownership ───────────────────────────────────────────────

  private async checkOwnership(userId: string, companyId: number): Promise<void> {
    const company = await this.databaseService.company.findFirst({
      where: { id: companyId, deleted: false },
      select: { ownerId: true },
    });
    if (!company) throw new NotFoundException('Entreprise introuvable');
    if (company.ownerId !== userId) throw new ForbiddenException('Non autorise');
  }

  // ─── Options ──────────────────────────────────────────────────────────────

  async upsertOptions(userId: string, companyId: number, dto: UpsertOptionsDto) {
    await this.checkOwnership(userId, companyId);

    return this.databaseService.companyDefaultOptions.upsert({
      where: { companyId },
      update: { maxPassagesPerDay: dto.maxPassagesPerDay },
      create: { companyId, maxPassagesPerDay: dto.maxPassagesPerDay },
      select: { id: true, companyId: true, maxPassagesPerDay: true },
    });
  }

  async getOptions(companyId: number) {
    return this.databaseService.companyDefaultOptions.findUnique({
      where: { companyId },
      select: { id: true, companyId: true, maxPassagesPerDay: true },
    });
  }

  // ─── Avantages ────────────────────────────────────────────────────────────

  async createBenefit(userId: string, companyId: number, dto: CreateBenefitDto) {
    await this.checkOwnership(userId, companyId);

    return this.databaseService.companyBenefit.create({
      data: { companyId, title: dto.title, description: dto.description, minPassages: dto.minPassages },
      select: { id: true, title: true, description: true, minPassages: true, companyId: true },
    });
  }

  getBenefits(companyId: number) {
    return this.databaseService.companyBenefit.findMany({
      where: { companyId, deleted: false },
      select: { id: true, title: true, description: true, minPassages: true },
      orderBy: { minPassages: 'asc' },
    });
  }

  async updateBenefit(userId: string, companyId: number, benefitId: number, dto: UpdateBenefitDto) {
    await this.checkOwnership(userId, companyId);

    return this.databaseService.companyBenefit.update({
      where: { id: benefitId },
      data: { title: dto.title, description: dto.description, minPassages: dto.minPassages },
      select: { id: true, title: true, description: true, minPassages: true, companyId: true },
    });
  }

  async deleteBenefit(userId: string, companyId: number, benefitId: number): Promise<void> {
    await this.checkOwnership(userId, companyId);

    await this.databaseService.companyBenefit.update({
      where: { id: benefitId },
      data: { deleted: true },
    });
  }
}
