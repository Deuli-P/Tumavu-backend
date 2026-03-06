import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AccessModule } from './access/access.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { CompanyModule } from './company/company.module';
import { AnnonceModule } from './annonce/annonce.module';
import { DocumentModule } from './document/document.module';
import { PassageModule } from './passage/passage.module';
import { SettingsModule } from './settings/settings.module';
import { StationModule } from './station/station.module';
import { PermissionModule } from './permission/permission.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TagModule } from './tag/tag.module';
import { InviteModule } from './invite/invite.module';
import { NotificationModule } from './notification/notification.module';
import { JobCategoryModule } from './job-category/job-category.module';
import { JobModule } from './job/job.module';
import { JobOfferModule } from './job-offer/job-offer.module';

// Module racine: il assemble la configuration, les modules, controllers et services.
@Module({
  imports: [
    // Charge les variables d'environnement depuis .env de maniere globale.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    UsersModule,
    DatabaseModule,
    AccessModule,
    AuthModule,
    StorageModule,
    CompanyModule,
    AnnonceModule,
    DocumentModule,
    PassageModule,
    SettingsModule,
    StationModule,
    PermissionModule,
    DashboardModule,
    TagModule,
    InviteModule,
    NotificationModule,
    JobCategoryModule,
    JobModule,
    JobOfferModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
