import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

// Module racine: il assemble la configuration, les modules, controllers et services.
@Module({
  imports: [
    // Charge les variables d'environnement depuis .env de maniere globale.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Rend PrismaService disponible dans toute l'application.
    PrismaModule,
    // Module contenant l'exemple d'endpoint users + Prisma.
    UsersModule,
    // Module d'inscription: POST /api/auth/create-user
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
