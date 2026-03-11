import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuthenticatedRequestUser } from '../auth-user.interface';
import { TokenService } from '../token.service';

const COOKIE_NAME = 'auth_token';
const ADMIN_COOKIE_NAME = 'auth_token_admin';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly databaseService: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = await this.resolveToken(
      request.cookies ?? {},
      request.headers?.authorization,
    );

    if (!token) {
      throw new UnauthorizedException('Token manquant');
    }

    const payload = this.tokenService.verifyAuthToken(token);

    const tokenHash = this.tokenService.hashToken(token);
    const session = await this.databaseService.session.findUnique({
      where: { tokenHash },
      select: { expiresAt: true },
    });

    if (!session) throw new UnauthorizedException('Session invalide ou expirée');
    if (session.expiresAt < new Date()) {
      await this.databaseService.session.deleteMany({ where: { tokenHash } });
      throw new UnauthorizedException('Token expiré');
    }

    const auth = await this.databaseService.auth.findFirst({
      where: { id: payload.sub, deleted: false },
      select: {
        id: true,
        email: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: { select: { type: true } },
            companies: { where: { deleted: false }, select: { id: true }, take: 1 },
          },
        },
      },
    });

    if (!auth?.user) throw new UnauthorizedException('Utilisateur introuvable');

    const userContext: AuthenticatedRequestUser = {
      authId: auth.id,
      userId: auth.user.id,
      email: auth.email,
      firstName: auth.user.firstName,
      lastName: auth.user.lastName,
      isCompanyOwner: auth.user.companies.length > 0,
      isAdmin: auth.user.role.type === 'ADMIN',
    };

    request.user = userContext;
    return true;
  }

  // Résout le bon token parmi les cookies présents.
  // Stratégie : utilise le token qui a une session valide en DB.
  // Si les deux sont valides, préfère auth_token_admin (session admin prioritaire).
  private async resolveToken(
    cookies: Record<string, string>,
    authHeader?: string,
  ): Promise<string | null> {
    // Bearer token (mobile / API clients)
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    const adminToken = cookies[ADMIN_COOKIE_NAME];
    const userToken = cookies[COOKIE_NAME];

    if (adminToken && userToken) {
      const adminValid = await this.hasValidSession(adminToken);
      if (adminValid) return adminToken;
      return userToken;
    }

    return adminToken ?? userToken ?? null;
  }

  private async hasValidSession(token: string): Promise<boolean> {
    try {
      this.tokenService.verifyAuthToken(token);
      const tokenHash = this.tokenService.hashToken(token);
      const session = await this.databaseService.session.findUnique({
        where: { tokenHash },
        select: { expiresAt: true },
      });
      return !!session && session.expiresAt > new Date();
    } catch {
      return false;
    }
  }
}
