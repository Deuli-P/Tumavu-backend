import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Etend PrismaClient pour l'integrer au cycle de vie NestJS.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Connexion auto a la base quand le module demarre.
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  // Deconnexion propre quand l'application se ferme.
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  // Ferme proprement NestJS juste avant la sortie du process Node.
  enableShutdownHooks(app: INestApplication): void {
    process.once('beforeExit', () => {
      void app.close();
    });
  }
}
