import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationJobStatus } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { CreateStationDto } from './dto/create-station.dto';

export type StationPayload = {
  id: number;
  name: string;
  country: { id: number; name: string; code: string };
  officeAddress: {
    street: string;
    streetNumber: string | null;
    zipCode: string | null;
    locality: string;
    country: { id: number; name: string; code: string };
  };
};

export type StationDetail = StationPayload & {
  kpis: {
    companiesCount: number;
    passagesThisWeek: number;
    passagesThisMonth: number;
    workersCount: number;
  };
  companies: {
    id: string;
    name: string;
    type: string | null;
    phone: string | null;
    owner: { firstName: string; lastName: string };
    address: { locality: string; country: { name: string } };
    _count: { jobOffers: number; passages: number };
  }[];
  recentJobOffers: {
    id: number;
    title: string;
    status: string;
    contractType: string | null;
    createdAt: Date;
    job: { title: string };
    company: { name: string } | null;
    _count: { applications: number };
  }[];
};

@Injectable()
export class StationService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createStation(dto: CreateStationDto): Promise<StationPayload> {
    const existing = await this.databaseService.station.findFirst({
      where: { name: dto.name, deleted: false },
      select: { id: true },
    });
    if (existing) throw new ConflictException('Une station avec ce nom existe déjà');

    const station = await this.databaseService.station.create({
      data: {
        name: dto.name,
        country: { connect: { id: dto.countryId } },
        officeAddress: {
          create: {
            street: dto.officeAddress.street,
            streetNumber: dto.officeAddress.streetNumber,
            zipCode: dto.officeAddress.zipCode,
            locality: dto.officeAddress.locality,
            country: { connect: { id: dto.countryId } },
          },
        },
      },
      select: {
        id: true,
        name: true,
        country: { select: { id: true, name: true, code: true } },
        officeAddress: {
          select: {
            street: true,
            streetNumber: true,
            zipCode: true,
            locality: true,
            country: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    return station;
  }

  async findOneAdmin(id: number): Promise<StationDetail> {
    const station = await this.databaseService.station.findFirst({
      where: { id, deleted: false },
      select: {
        id: true,
        name: true,
        country: { select: { id: true, name: true, code: true } },
        officeAddress: {
          select: {
            street: true,
            streetNumber: true,
            zipCode: true,
            locality: true,
            country: { select: { id: true, name: true, code: true } },
          },
        },
        companies: {
          where: { deleted: false },
          select: {
            id: true,
            name: true,
            type: true,
            phone: true,
            owner: { select: { firstName: true, lastName: true } },
            address: { select: { locality: true, country: { select: { name: true } } } },
            _count: { select: { jobOffers: { where: { deleted: false } }, passages: true } },
          },
        },
      },
    });

    if (!station) throw new NotFoundException('Station introuvable');

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [passagesWeek, passagesMonth, workerRows, recentJobOffers] =
      await Promise.all([
        this.databaseService.passage.count({
          where: { company: { stationId: id, deleted: false }, createdAt: { gte: startOfWeek } },
        }),
        this.databaseService.passage.count({
          where: { company: { stationId: id, deleted: false }, createdAt: { gte: startOfMonth } },
        }),
        this.databaseService.applicationJob.findMany({
          where: {
            deleted: false,
            status: ApplicationJobStatus.ACCEPTED,
            offer: { deleted: false, company: { stationId: id, deleted: false } },
          },
          select: { userId: true },
          distinct: ['userId'],
        }),
        this.databaseService.jobOffer.findMany({
          where: { deleted: false, company: { stationId: id, deleted: false } },
          select: {
            id: true,
            title: true,
            status: true,
            contractType: true,
            createdAt: true,
            job: { select: { title: true } },
            company: { select: { name: true } },
            _count: { select: { applications: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

    return {
      ...station,
      kpis: {
        companiesCount: station.companies.length,
        passagesThisWeek: passagesWeek,
        passagesThisMonth: passagesMonth,
        workersCount: workerRows.length,
      },
      recentJobOffers,
    };
  }

  async listStations(): Promise<StationPayload[]> {
    return this.databaseService.station.findMany({
      where: { deleted: false },
      select: {
        id: true,
        name: true,
        country: { select: { id: true, name: true, code: true } },
        officeAddress: {
          select: {
            street: true,
            streetNumber: true,
            zipCode: true,
            locality: true,
            country: { select: { id: true, name: true, code: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
