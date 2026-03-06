import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function uniqueSlug(
  db: DatabaseService,
  companyId: string,
  base: string,
  excludeId?: number,
): Promise<string> {
  let slug = base;
  let suffix = 0;
  while (true) {
    const existing = await db.job.findFirst({
      where: { companyId, slug, deleted: false, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    if (!existing) return slug;
    suffix++;
    slug = `${base}-${suffix}`;
  }
}

const JOB_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
  responsibilities: true,
  requirements: true,
  skills: true,
  experienceLevel: true,
  physicalRequirements: true,
  licences: true,
  season: true,
  transportRequired: true,
  createdAt: true,
  category: { select: { id: true, name: true, slug: true } },
  tags: {
    where: { deleted: false },
    select: { tag: { select: { id: true, name: true } } },
  },
  _count: { select: { jobOffers: true } },
} as const;

@Injectable()
export class JobService {
  constructor(private readonly databaseService: DatabaseService) {}

  private async getCompanyForManager(userId: string) {
    const company = await this.databaseService.company.findFirst({
      where: { ownerId: userId, deleted: false },
      select: { id: true },
    });
    if (!company) throw new NotFoundException('Entreprise introuvable');
    return company;
  }

  async create(managerId: string, dto: CreateJobDto) {
    const company = await this.getCompanyForManager(managerId);
    const slug = await uniqueSlug(this.databaseService, company.id, generateSlug(dto.title));

    const job = await this.databaseService.job.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        responsibilities: dto.responsibilities,
        requirements: dto.requirements,
        skills: dto.skills ?? [],
        experienceLevel: dto.experienceLevel,
        physicalRequirements: dto.physicalRequirements,
        licences: dto.licences ?? [],
        season: dto.season,
        transportRequired: dto.transportRequired ?? false,
        companyId: company.id,
        createdBy: managerId,
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.tagIds?.length && {
          tags: { create: dto.tagIds.map((tagId) => ({ tagId })) },
        }),
      },
      select: JOB_SELECT,
    });

    return { ...job, tags: job.tags.map((t) => t.tag) };
  }

  async update(managerId: string, jobId: number, dto: UpdateJobDto) {
    const company = await this.getCompanyForManager(managerId);
    const job = await this.databaseService.job.findFirst({
      where: { id: jobId, companyId: company.id, deleted: false },
      select: { id: true },
    });
    if (!job) throw new NotFoundException('Poste introuvable');

    let slug: string | undefined;
    if (dto.title) {
      slug = await uniqueSlug(this.databaseService, company.id, generateSlug(dto.title), jobId);
    }

    if (dto.tagIds !== undefined) {
      await this.databaseService.$transaction(async (tx) => {
        await tx.tagJob.updateMany({ where: { jobId, deleted: false }, data: { deleted: true } });
        if (dto.tagIds!.length > 0) {
          await tx.tagJob.createMany({ data: dto.tagIds!.map((tagId) => ({ jobId, tagId })) });
        }
      });
    }

    const updated = await this.databaseService.job.update({
      where: { id: jobId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(slug && { slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.responsibilities !== undefined && { responsibilities: dto.responsibilities }),
        ...(dto.requirements !== undefined && { requirements: dto.requirements }),
        ...(dto.skills !== undefined && { skills: dto.skills }),
        ...(dto.experienceLevel !== undefined && { experienceLevel: dto.experienceLevel }),
        ...(dto.physicalRequirements !== undefined && { physicalRequirements: dto.physicalRequirements }),
        ...(dto.licences !== undefined && { licences: dto.licences }),
        ...(dto.season !== undefined && { season: dto.season }),
        ...(dto.transportRequired !== undefined && { transportRequired: dto.transportRequired }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId ?? null }),
      },
      select: JOB_SELECT,
    });

    return { ...updated, tags: updated.tags.map((t) => t.tag) };
  }

  async findAll(managerId: string) {
    const company = await this.getCompanyForManager(managerId);

    const jobs = await this.databaseService.job.findMany({
      where: { companyId: company.id, deleted: false },
      select: JOB_SELECT,
      orderBy: { createdAt: 'desc' },
    });

    return jobs.map((j) => ({ ...j, tags: j.tags.map((t) => t.tag) }));
  }

  async findOne(managerId: string, jobId: number) {
    const company = await this.getCompanyForManager(managerId);

    const job = await this.databaseService.job.findFirst({
      where: { id: jobId, companyId: company.id, deleted: false },
      select: {
        ...JOB_SELECT,
        jobOffers: {
          where: { deleted: false },
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            _count: { select: { applications: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!job) throw new NotFoundException('Poste introuvable');
    return { ...job, tags: job.tags.map((t) => t.tag) };
  }

  async remove(managerId: string, jobId: number): Promise<void> {
    const company = await this.getCompanyForManager(managerId);
    const job = await this.databaseService.job.findFirst({
      where: { id: jobId, companyId: company.id, deleted: false },
      select: { id: true },
    });
    if (!job) throw new NotFoundException('Poste introuvable');

    await this.databaseService.job.update({ where: { id: jobId }, data: { deleted: true } });
  }

  async listAdmin() {
    return this.databaseService.job.findMany({
      where: { deleted: false },
      select: {
        id: true,
        title: true,
        slug: true,
        season: true,
        experienceLevel: true,
        createdAt: true,
        category: { select: { id: true, name: true } },
        company: { select: { id: true, name: true, station: { select: { id: true, name: true } } } },
        _count: { select: { jobOffers: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
