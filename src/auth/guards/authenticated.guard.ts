import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuthenticatedRequestUser } from '../auth-user.interface';
import { TokenService } from '../token.service';

const COOKIE_NAME = 'auth_token';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly databaseService: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // On prend les cookies 
    const request = context.switchToHttp().getRequest();
    console.log('request cookies :', request);
    const token = request.cookies?.[COOKIE_NAME] as string | undefined;


    // Si pas de token => pas authentifié
    if (!token) {
      throw new UnauthorizedException('Token manquant');
    }

    const payload = this.tokenService.verifyAuthToken(token);

    // Vérifie que la session existe en base (permet la déconnexion côté serveur).
    const tokenHash = this.tokenService.hashToken(token);
    const session = await this.databaseService.session.findUnique({
      where: { tokenHash },
      select: { expiresAt: true },
    });

    if (!session) {
      throw new UnauthorizedException('Session invalide ou expirée');
    }

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
            companies: {
              where: { deleted: false },
              select: { id: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!auth?.user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean);

    const userContext: AuthenticatedRequestUser = {
      authId: auth.id,
      userId: auth.user.id,
      email: auth.email,
      firstName: auth.user.firstName,
      lastName: auth.user.lastName,
      isCompanyOwner: auth.user.companies.length > 0,
      isAdmin: adminEmails.includes(auth.email.toLowerCase()),
    };

    request.user = userContext;
    return true;
  }
}
