import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../token.service';

const COOKIE_NAME = 'auth_token';

@Injectable()
export class GuestOnlyGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  // Autorise uniquement les requêtes sans session active.
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.[COOKIE_NAME] as string | undefined;

    if (!token) return true;

    try {
      this.tokenService.verifyAuthToken(token);
      // Token valide → déjà connecté
      throw new UnauthorizedException('Vous êtes déjà connecté');
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      // Token invalide ou expiré → laisser passer
      return true;
    }
  }
}
