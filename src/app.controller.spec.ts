import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Test unitaire du controller (sans serveur HTTP reel).
describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    // Construit un module de test minimal avec controller + service.
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return backend health data', () => {
      // Verifie que la route logique renvoie l'etat attendu.
      const response = appController.health();
      expect(response.status).toBe('ok');
      expect(response.service).toBe('tumavu-backend');
    });
  });
});
