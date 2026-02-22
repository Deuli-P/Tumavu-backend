import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../token.service';

@Injectable()
export class GuestOnlyGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  // Autorise uniquement les requetes sans token valide.
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization as string | undefined;

    if (!authHeader) {
      return true;
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    try {
      this.tokenService.verifyAuthToken(token);
      throw new UnauthorizedException('Vous etes deja connecte');
    } catch {
      return true;
    }
  }
}
