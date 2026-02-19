import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// Controller HTTP principal.
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Endpoint de sante: GET /api/health
  @Get('health')
  health(): { status: string; service: string; timestamp: string } {
    return this.appService.health();
  }
}
