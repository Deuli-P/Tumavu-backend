import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class KeepaliveService {
  private readonly logger = new Logger(KeepaliveService.name);

  constructor(private readonly db: DatabaseService) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async ping() {
    try {
      await this.db.$queryRaw`SELECT * FROM new_day LIMIT 1;`;
      this.logger.log('Supabase keepalive ping OK');
    } catch (err) {
      this.logger.error('Supabase keepalive ping FAILED', err);
    }
  }
}
