import { BadRequestException, Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { SupabaseStorageService } from '../storage/supabase-storage.service';
import { ListUsersAdminDto } from './dto/list-users-admin.dto';

export type AdminUserItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: { id: number; name: string; code: string } | null;
  role: { id: number; value: string; type: string };
  company: { id: string; name: string } | null;
  createdAt: string;
  lastLoginAt: string | null;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly storageService: SupabaseStorageService,
  ) {}
  create(createUserDto: Prisma.UserCreateInput) {
    return this.databaseService.user.create({ data: createUserDto });
  }

  findAll() {
    return this.databaseService.user.findMany();
  }

  findOne(id: string) {
    return this.databaseService.user.findUnique({ where: { id } });
  }

  update(id: string, updateUserDto: Prisma.UserUpdateInput) {
    return this.databaseService.user.update({ where: { id }, data: updateUserDto });
  }

  remove(id: string) {
    return this.databaseService.user.delete({ where: { id } });
  }

  async updateContact(
    userId: string,
    data: { phone?: string; city?: string; postalCode?: string; countryId?: number },
  ): Promise<void> {
    await this.databaseService.user.update({
      where: { id: userId },
      data,
    });
  }

  async updatePhoto(
    userId: string,
    file: { buffer: Buffer; mimetype: string },
  ): Promise<{ publicUrl: string }> {
    const extension = file.mimetype.split('/')[1] || 'jpg';
    const storagePath = `${userId}/photo/photo_${Date.now()}.${extension}`;

    const { publicUrl } = await this.storageService.uploadFile(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

    const publicUrlData= this.storageService.getPublicUrl(storagePath);

    console.log('publicUrlData', publicUrlData);

    await this.databaseService.user.update({
      where: { id: userId },
      data: { photoPath: publicUrlData },
    });

    return { publicUrl: publicUrlData };
  }

  async listUsersAdmin(dto: ListUsersAdminDto): Promise<AdminUserItem[]> {
    const users = await this.databaseService.user.findMany({
      where: {
        deleted: false,
        role: { type: { not: 'ADMIN' } },
        ...(dto.countries?.length ? { country: { name: { in: dto.countries } } } : {}),
        ...(dto.hasRole === 'owner'
          ? { companies: { some: { deleted: false } } }
          : dto.hasRole === 'user'
            ? { companies: { none: {} } }
            : {}),
        auth: {
          deleted: false,
          ...(dto.lastLoginFrom || dto.lastLoginTo
            ? {
                lastSignInAt: {
                  ...(dto.lastLoginFrom ? { gte: new Date(dto.lastLoginFrom) } : {}),
                  ...(dto.lastLoginTo ? { lte: new Date(dto.lastLoginTo) } : {}),
                },
              }
            : {}),
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        country: { select: { id: true, name: true, code: true } },
        role: { select: { id: true, value: true, type: true } },
        companies: {
          where: { deleted: false },
          select: { id: true, name: true },
          take: 1,
        },
        auth: { select: { email: true, createdAt: true, lastSignInAt: true } },
      },
      orderBy: { auth: { createdAt: 'desc' } },
    });

    return users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.auth?.email ?? '',
      country: u.country ?? null,
      role: u.role,
      company: u.companies[0] ?? null,
      createdAt: u.auth?.createdAt.toISOString() ?? '',
      lastLoginAt: u.auth?.lastSignInAt?.toISOString() ?? null,
    }));
  }

  async listUsersAdminCountries(): Promise<string[]> {
    const rows = await this.databaseService.user.findMany({
      where: {
        deleted: false,
        countryId: { not: null },
        role: { type: { not: 'ADMIN' } },
      },
      select: { country: { select: { name: true } } },
      distinct: ['countryId'],
      orderBy: { country: { name: 'asc' } },
    });
    return rows.map((r) => r.country!.name);
  }

  async updateLanguage(userId: string, languageId: number): Promise<void> {
    const language = await this.databaseService.language.findUnique({
      where: { id: languageId },
      select: { id: true },
    });

    if (!language) {
      throw new BadRequestException('PUT_LANGUAGE_ERROR');
    }

    await this.databaseService.user.update({
      where: { id: userId },
      data: { languageId },
    });
  }
};
