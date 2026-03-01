import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

// Point d'entree de l'application NestJS.
async function bootstrap(): Promise<void> {
  // Cree l'application a partir du module racine.
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);
  // Lit PORT depuis .env, sinon fallback sur 3000.
  const port = configService.get<number>('PORT', 3000);

  // Tous les endpoints seront prefixes par /api.
  app.setGlobalPrefix('api');
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
    : ['http://localhost:5173'];
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });
  app.use(cookieParser());

  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });
  // Validation globale des DTO (utile des qu'on ajoute des routes avec body/query).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Permet d'arreter proprement Nest quand Prisma se ferme.
  prismaService.enableShutdownHooks(app);

  await app.listen(port);
  console.log(`Tumavu backend listening on http://localhost:${port}/api`);
}

void bootstrap();
