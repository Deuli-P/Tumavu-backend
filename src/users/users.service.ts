import { BadRequestException, Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { SupabaseStorageService } from '../storage/supabase-storage.service';

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
    data: { phone?: string; city?: string; postalCode?: string; country?: string },
  ): Promise<void> {
    await this.databaseService.user.update({
      where: { id: userId },
      data,
    });
  }

  async updatePhoto(
    userId: string,
    file: { buffer: Buffer; mimetype: string },
  ): Promise<{ slug: string; publicUrl: string }> {
    const extension = file.mimetype.split('/')[1] || 'jpg';
    const storagePath = `${userId}/photo/photo_${Date.now()}.${extension}`;

    const { publicUrl } = await this.storageService.uploadFile(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

    await this.databaseService.user.update({
      where: { id: userId },
      data: { photoPath: storagePath },
    });

    return { slug: storagePath, publicUrl };
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
