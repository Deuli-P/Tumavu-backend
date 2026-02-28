import { Controller, Get, Put } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('utils')
  getUtils() {
    return this.settingsService.getUtils();
  }


  @Put('notifications')
  updateNotifications() {
    // TODO: Implement the updateNotifications method
    //return this.settingsService.updateNotifications();
  }
}
