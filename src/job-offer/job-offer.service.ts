import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationJobStatus, JobOfferStatus } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { NotificationService } from '../notification/notification.service';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';
import { ApplyJobOfferDto } from './dto/apply-job-offer.dto';
import { ListJobOfferAdminDto } from './dto/list-job-offer-admin.dto';

const OFFER_SELECT = {
  id: true,
  title: true,
  description: true,
  status: true,
  contractType: true,
  startDate: true,
  endDate: true,
  duration: true,
  flexibleDates: true,
  hoursPerWeek: true,
  schedule: true,
  salaryType: true,
  salaryMin: true,
  salaryMax: true,
  currency: true,
  housingProvided: true,
  housingCost: true,
  housingDescription: true,
  mealsProvided: true,
  transportHelp: true,
  tips: true,
  bonus: true,
  nearTrainStation: true,
  applicationDeadline: true,
  createdAt: true,
  job: {
    select: {
      id: true,
      title: true,
      slug: true,
      skills: true,
      season: true,
      experienceLevel: true,
      category: { select: { id: true, name: true } },
    },
  },
  company: {
    select: {
      id: true,
      name: true,
      address: { select: { locality: true, country: { select: { name: true } } } },
    },
  },
  address: { select: { street: true, locality: true, country: { select: { name: true } } } },
  _count: { select: { applications: true } },
} as const;

const APPLICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: 'en attente',
  ACCEPTED: 'acceptée',
  REJECTED: 'refusée',
  INTERVIEW: 'entretien planifié',
  TEST: 'test prévu',
  PHONE: 'entretien téléphonique',
};

@Injectable()
export class JobOfferService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly notificationService: NotificationService,
  ) {}

  private async getCompanyForManager(userId: string) {
    const company = await this.databaseService.company.findFirst({
      where: { ownerId: userId, deleted: false },
      select: { id: true },
    });
    if (!company) throw new NotFoundException('Entreprise introuvable');
    return company;
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  async create(managerId: string, dto: CreateJobOfferDto) {
    const company = await this.getCompanyForManager(managerId);

    const job = await this.databaseService.job.findFirst({
      where: { id: dto.jobId, companyId: company.id, deleted: false },
      select: { id: true },
    });
    if (!job) throw new NotFoundException('Poste introuvable');

    return this.databaseService.jobOffer.create({
      data: {
        jobId: dto.jobId,
        companyId: company.id,
        createdBy: managerId,
        title: dto.title,
        description: dto.description,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        duration: dto.duration,
        flexibleDates: dto.flexibleDates ?? false,
        hoursPerWeek: dto.hoursPerWeek,
        schedule: dto.schedule,
        addressId: dto.addressId,
        salaryType: dto.salaryType,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        currency: dto.currency ?? 'EUR',
        housingProvided: dto.housingProvided ?? 'NONE',
        housingCost: dto.housingCost,
        housingDescription: dto.housingDescription,
        mealsProvided: dto.mealsProvided ?? false,
        transportHelp: dto.transportHelp ?? false,
        tips: dto.tips ?? false,
        bonus: dto.bonus ?? false,
        contractType: dto.contractType,
        applicationDeadline: dto.applicationDeadline ? new Date(dto.applicationDeadline) : undefined,
        nearTrainStation: dto.nearTrainStation ?? false,
        status: 'DRAFT',
      },
      select: OFFER_SELECT,
    });
  }

  async update(managerId: string, offerId: number, dto: UpdateJobOfferDto) {
    await this.checkManagerOwnership(managerId, offerId);

    return this.databaseService.jobOffer.update({
      where: { id: offerId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startDate !== undefined && { startDate: dto.startDate ? new Date(dto.startDate) : null }),
        ...(dto.endDate !== undefined && { endDate: dto.endDate ? new Date(dto.endDate) : null }),
        ...(dto.duration !== undefined && { duration: dto.duration }),
        ...(dto.flexibleDates !== undefined && { flexibleDates: dto.flexibleDates }),
        ...(dto.hoursPerWeek !== undefined && { hoursPerWeek: dto.hoursPerWeek }),
        ...(dto.schedule !== undefined && { schedule: dto.schedule }),
        ...(dto.addressId !== undefined && { addressId: dto.addressId }),
        ...(dto.salaryType !== undefined && { salaryType: dto.salaryType }),
        ...(dto.salaryMin !== undefined && { salaryMin: dto.salaryMin }),
        ...(dto.salaryMax !== undefined && { salaryMax: dto.salaryMax }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.housingProvided !== undefined && { housingProvided: dto.housingProvided }),
        ...(dto.housingCost !== undefined && { housingCost: dto.housingCost }),
        ...(dto.housingDescription !== undefined && { housingDescription: dto.housingDescription }),
        ...(dto.mealsProvided !== undefined && { mealsProvided: dto.mealsProvided }),
        ...(dto.transportHelp !== undefined && { transportHelp: dto.transportHelp }),
        ...(dto.tips !== undefined && { tips: dto.tips }),
        ...(dto.bonus !== undefined && { bonus: dto.bonus }),
        ...(dto.contractType !== undefined && { contractType: dto.contractType }),
        ...(dto.applicationDeadline !== undefined && { applicationDeadline: dto.applicationDeadline ? new Date(dto.applicationDeadline) : null }),
        ...(dto.nearTrainStation !== undefined && { nearTrainStation: dto.nearTrainStation }),
      },
      select: OFFER_SELECT,
    });
  }

  async publish(managerId: string, offerId: number) {
    await this.checkManagerOwnership(managerId, offerId);
    return this.databaseService.jobOffer.update({
      where: { id: offerId },
      data: { status: JobOfferStatus.PUBLISHED },
      select: { id: true, status: true },
    });
  }

  async close(managerId: string, offerId: number) {
    await this.checkManagerOwnership(managerId, offerId);
    return this.databaseService.jobOffer.update({
      where: { id: offerId },
      data: { status: JobOfferStatus.CLOSED },
      select: { id: true, status: true },
    });
  }

  async remove(managerId: string, offerId: number): Promise<void> {
    await this.checkManagerOwnership(managerId, offerId);
    await this.databaseService.jobOffer.update({ where: { id: offerId }, data: { deleted: true } });
  }

  async findAll(managerId: string, status?: JobOfferStatus) {
    const company = await this.getCompanyForManager(managerId);

    return this.databaseService.jobOffer.findMany({
      where: {
        companyId: company.id,
        deleted: false,
        ...(status ? { status } : {}),
      },
      select: OFFER_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async browse(userId: string, filters: { countryId?: number; tagId?: number } = {}) {
    const offers = await this.databaseService.jobOffer.findMany({
      where: {
        deleted: false,
        status: JobOfferStatus.PUBLISHED,
        ...(filters.countryId
          ? { company: { address: { countryId: filters.countryId } } }
          : {}),
        ...(filters.tagId
          ? { job: { tags: { some: { tagId: filters.tagId, deleted: false } } } }
          : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        contractType: true,
        startDate: true,
        endDate: true,
        duration: true,
        hoursPerWeek: true,
        salaryType: true,
        salaryMin: true,
        salaryMax: true,
        currency: true,
        housingProvided: true,
        mealsProvided: true,
        transportHelp: true,
        applicationDeadline: true,
        createdAt: true,
        applications: {
          where: { userId, deleted: false },
          select: { id: true },
          take: 1,
        },
        job: {
          select: {
            title: true,
            experienceLevel: true,
            season: true,
            category: { select: { name: true } },
            tags: {
              where: { deleted: false },
              select: { tag: { select: { id: true, name: true } } },
            },
          },
        },
        company: {
          select: {
            name: true,
            address: {
              select: {
                locality: true,
                country: { select: { id: true, name: true, code: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return offers.map(({ applications, ...offer }) => ({
      ...offer,
      hasApplied: applications.length > 0,
    }));
  }

  async findOne(offerId: number) {
    const offer = await this.databaseService.jobOffer.findFirst({
      where: { id: offerId, deleted: false },
      select: {
        ...OFFER_SELECT,
        job: {
          select: {
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
            category: { select: { id: true, name: true } },
            tags: {
              where: { deleted: false },
              select: { tag: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });

    if (!offer) throw new NotFoundException('Offre introuvable');
    return offer;
  }

  // ─── Applications ─────────────────────────────────────────────────────────

  async apply(userId: string, offerId: number, dto: ApplyJobOfferDto) {
    const offer = await this.databaseService.jobOffer.findFirst({
      where: { id: offerId, deleted: false, status: JobOfferStatus.PUBLISHED },
      select: {
        id: true,
        title: true,
        createdBy: true,
        company: { select: { id: true } },
      },
    });

    if (!offer) throw new NotFoundException('Offre introuvable ou non disponible');

    const existing = await this.databaseService.applicationJob.findFirst({
      where: { offerId, userId, deleted: false },
      select: { id: true },
    });
    if (existing) throw new ConflictException('Vous avez déjà postulé à cette offre');

    const application = await this.databaseService.applicationJob.create({
      data: {
        offerId,
        userId,
        status: ApplicationJobStatus.PENDING,
        message: dto.message,
        resumeUrl: dto.resumeUrl,
      },
      select: { id: true, status: true, createdAt: true },
    });

    const applicant = await this.databaseService.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });
    const applicantName = applicant ? `${applicant.firstName} ${applicant.lastName}` : 'Un candidat';

    await this.notificationService.create({
      userId: offer.createdBy,
      type: 'APPLICATION_RECEIVED',
      title: 'Nouvelle candidature',
      body: `${applicantName} a postulé à votre offre «${offer.title}».`,
      deepLink: `/app/job-offer/${offerId}/applications`,
      metadata: { applicationId: application.id, offerId, companyId: offer.company.id },
    });

    return application;
  }

  async findApplications(managerId: string, offerId: number) {
    await this.checkManagerOwnership(managerId, offerId);

    return this.databaseService.jobOffer.findFirst({
      where: { id: offerId, deleted: false },
      select: {
        id: true,
        title: true,
        status: true,
        applications: {
          where: { deleted: false },
          select: {
            id: true,
            status: true,
            message: true,
            resumeUrl: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                country: { select: { name: true } },
                auth: { select: { email: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async updateApplicationStatus(managerId: string, applicationId: number, status: ApplicationJobStatus) {
    const application = await this.databaseService.applicationJob.findFirst({
      where: { id: applicationId, deleted: false },
      select: {
        id: true,
        userId: true,
        offerId: true,
        offer: { select: { id: true, title: true, createdBy: true, companyId: true } },
      },
    });

    if (!application) throw new NotFoundException('Candidature introuvable');

    // Verify manager owns the company for this offer
    const company = await this.databaseService.company.findFirst({
      where: { id: application.offer.companyId, ownerId: managerId, deleted: false },
      select: { id: true },
    });
    if (!company) throw new ForbiddenException('Non autorisé');

    await this.databaseService.applicationJob.update({
      where: { id: applicationId },
      data: { status, processedBy: managerId, processedAt: new Date() },
    });

    const label = APPLICATION_STATUS_LABELS[status] ?? status.toLowerCase();
    await this.notificationService.create({
      userId: application.userId,
      type: 'APPLICATION_STATUS',
      title: 'Statut de candidature mis à jour',
      body: `Votre candidature pour «${application.offer.title}» est désormais ${label}.`,
      deepLink: `tumavu://applications/${applicationId}`,
      metadata: { applicationId, offerId: application.offerId, status },
    });

    return { id: applicationId, status };
  }

  async getMyApplications(managerId: string, status?: ApplicationJobStatus) {
    const company = await this.getCompanyForManager(managerId);

    return this.databaseService.applicationJob.findMany({
      where: {
        deleted: false,
        ...(status ? { status } : {}),
        offer: { companyId: company.id, deleted: false },
      },
      select: {
        id: true,
        status: true,
        message: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            auth: { select: { email: true } },
          },
        },
        offer: {
          select: {
            id: true,
            title: true,
            job: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  async listAdmin(dto: ListJobOfferAdminDto = {}) {
    return this.databaseService.jobOffer.findMany({
      where: {
        deleted: false,
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.companyId ? { companyId: dto.companyId } : {}),
        ...(dto.stationId ? { company: { stationId: dto.stationId } } : {}),
      },
      select: {
        id: true,
        title: true,
        status: true,
        contractType: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        job: { select: { id: true, title: true } },
        company: { select: { id: true, name: true, station: { select: { id: true, name: true } } } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listApplicationsAdmin(filters: {
    status?: ApplicationJobStatus;
    companyId?: string;
    stationId?: number;
  } = {}) {
    return this.databaseService.applicationJob.findMany({
      where: {
        deleted: false,
        ...(filters.status ? { status: filters.status } : {}),
        offer: {
          deleted: false,
          ...(filters.companyId ? { companyId: filters.companyId } : {}),
          ...(filters.stationId ? { company: { stationId: filters.stationId } } : {}),
        },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            auth: { select: { email: true } },
          },
        },
        offer: {
          select: {
            id: true,
            title: true,
            company: { select: { id: true, name: true, station: { select: { id: true, name: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async checkManagerOwnership(managerId: string, offerId: number): Promise<void> {
    const offer = await this.databaseService.jobOffer.findFirst({
      where: { id: offerId, deleted: false },
      select: { company: { select: { ownerId: true } } },
    });
    if (!offer) throw new NotFoundException('Offre introuvable');
    if (offer.company.ownerId !== managerId) throw new ForbiddenException('Non autorisé');
  }
}
