import { Injectable } from '@nestjs/common';

// Service metier minimal pour exposer l'etat du backend.
@Injectable()
export class AppService {
  // Retourne un payload simple pour verifier que l'API repond.
  health(): { status: string; service: string; timestamp: string } {
    return {
      status: 'ok',
      service: 'tumavu-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
