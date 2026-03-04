import { Body, Injectable } from '@nestjs/common';
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

  async getCountries() {
    return this.databaseService.country.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    });
  }

  async updateNotifications(notifications: boolean ) {
    // TODO: Update the user's notification settings in the database
    return { message: 'Notification settings updated successfully' };
  };
}
