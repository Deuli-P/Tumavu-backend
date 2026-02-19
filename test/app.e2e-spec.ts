import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

// Test e2e: demarre une vraie app Nest en memoire et teste HTTP.
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // Charge le vrai module applicatif.
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/health (GET)', () => {
    // Appelle l'endpoint de sante et valide la reponse.
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
      });
  });
});
