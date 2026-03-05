import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { PasswordService } from '../auth/password.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateCompanyWithOwnerDto } from './dto/create-company-with-owner.dto';
import { UpsertOptionsDto } from './dto/upsert-options.dto';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';

export type CompanyListItem = {
  id: string;
  name: string;
  type: string | null;
  createdAt: string;
  address: {
    locality: string;
    country: { id: number; name: string; code: string };
  };
  station: { id: number; name: string };
  owner: { id: string; firstName: string; lastName: string };
  _count: { jobs: number; announcements: number };
};

export type CompanyDetail = {
  id: string;
  name: string;
  description: string | null;
  type: string | null;
  phone: string | null;
  createdAt: string;
  address: {
    street: string;
    number: string | null;
    locality: string;
    country: { name: string; code: string };
  };
  station: { id: number; name: string };
  owner: { id: string; firstName: string; lastName: string; email: string };
  jobs: {
    id: number;
    title: string;
    contractType: string | null;
    status: string | null;
    tags: { id: number; name: string }[];
    _count: { announcements: number };
  }[];
  announcements: {
    id: number;
    title: string;
    status: string | null;
    createdAt: string;
    jobTitle: string | null;
    _count: { applications: number };
  }[];
  kpis: {
    passagesWeek: number;
    passagesMonth: number;
  };
};

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
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly passwordService: PasswordService,
  ) {}

  async createCompany(ownerId: string, dto: CreateCompanyDto): Promise<CompanyPayload> {
    const company = await this.databaseService.company.create({
      data: {
        name: dto.name,
        description: dto.description,
        phone: dto.phone,
        type: dto.type,
        owner: { connect: { id: ownerId } },
        station: { connect: { id: dto.stationId } },
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

  async createCompanyWithOwner(dto: CreateCompanyWithOwnerDto): Promise<CompanyPayload> {
    const existing = await this.databaseService.auth.findFirst({
      where: { email: dto.owner.email.toLowerCase().trim(), deleted: false },
      select: { id: true },
    });
    if (existing) throw new ConflictException('Un compte avec cet email existe déjà');

    const [passwordHash, managerRole] = await Promise.all([
      this.passwordService.hash('azertyuiop'),
      this.databaseService.role.findFirstOrThrow({
        where: { type: 'MANAGER' },
        select: { id: true },
      }),
    ]);

    const ownerId = randomUUID();

    const company = await this.databaseService.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: ownerId,
          firstName: dto.owner.firstName,
          lastName: dto.owner.lastName,
          roleId: managerRole.id,
          countryId: dto.address.countryId,
          city: dto.address.locality,
        },
      });
      await tx.auth.create({
        data: {
          id: ownerId,
          email: dto.owner.email.toLowerCase().trim(),
          password: passwordHash,
        },
      });

      return tx.company.create({
        data: {
          name: dto.name,
          description: dto.description,
          phone: dto.phone,
          type: dto.type,
          owner: { connect: { id: ownerId } },
          station: { connect: { id: dto.stationId } },
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

  async findOneAdmin(id: string): Promise<CompanyDetail> {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [company, passagesWeek, passagesMonth] = await Promise.all([
      this.databaseService.company.findFirst({
        where: { id, deleted: false },
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          phone: true,
          createdAt: true,
          address: {
            select: {
              street: true,
              number: true,
              locality: true,
              country: { select: { name: true, code: true } },
            },
          },
          station: { select: { id: true, name: true } },
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              auth: { select: { email: true } },
            },
          },
          jobs: {
            where: { deleted: false },
            select: {
              id: true,
              title: true,
              contractType: true,
              status: true,
              tags: {
                where: { deleted: false },
                select: { tag: { select: { id: true, name: true } } },
              },
              _count: { select: { announcements: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
          announcements: {
            where: { deleted: false },
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
              job: { select: { title: true } },
              _count: { select: { applications: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      this.databaseService.passage.count({
        where: { companyId: id, createdAt: { gte: weekAgo } },
      }),
      this.databaseService.passage.count({
        where: { companyId: id, createdAt: { gte: monthAgo } },
      }),
    ]);

    if (!company) {
      throw new NotFoundException('Entreprise introuvable');
    }

    return {
      id: company.id,
      name: company.name,
      description: company.description,
      type: company.type,
      phone: company.phone,
      createdAt: company.createdAt.toISOString(),
      address: company.address,
      station: company.station,
      owner: {
        id: company.owner.id,
        firstName: company.owner.firstName,
        lastName: company.owner.lastName,
        email: company.owner.auth?.email ?? '',
      },
      jobs: company.jobs.map((j) => ({
        id: j.id,
        title: j.title,
        contractType: j.contractType ?? null,
        status: j.status ?? null,
        tags: j.tags.map((t) => t.tag),
        _count: j._count,
      })),
      announcements: company.announcements.map((a) => ({
        id: a.id,
        title: a.title,
        status: a.status ?? null,
        createdAt: a.createdAt.toISOString(),
        jobTitle: a.job?.title ?? null,
        _count: a._count,
      })),
      kpis: { passagesWeek, passagesMonth },
    };
  }

  async listCompanies(): Promise<CompanyListItem[]> {
    const companies = await this.databaseService.company.findMany({
      where: { deleted: false },
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true,
        address: {
          select: {
            locality: true,
            country: { select: { id: true, name: true, code: true } },
          },
        },
        station: { select: { id: true, name: true } },
        owner: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { jobs: true, announcements: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return companies.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      createdAt: c.createdAt.toISOString(),
      address: {
        locality: c.address.locality,
        country: c.address.country,
      },
      station: c.station,
      owner: c.owner,
      _count: c._count,
    }));
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
