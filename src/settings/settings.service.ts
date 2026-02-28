import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SettingsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getUtils() {
    const languages = await this.databaseService.language.findMany({
      select: { id: true, code: true, name: true },
      orderBy: { id: 'asc' },
    });

    return { languages };
  }
}
