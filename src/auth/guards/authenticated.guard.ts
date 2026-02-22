import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuthenticatedRequestUser } from '../auth-user.interface';
import { TokenService } from '../token.service';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly databaseService: DatabaseService,
  ) {}

  // Verifie le token, puis charge auth + user depuis la DB.
  // C'est ici qu'on respecte la separation: auth = identifiants, users = profil.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization as string | undefined;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token manquant');
    }

    const token = authHeader.slice(7);
    const payload = this.tokenService.verifyAuthToken(token);

    const auth = await this.databaseService.auth.findFirst({
      where: {
        id: payload.sub,
        deleted: false,
      },
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

    if (!auth || !auth.user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
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
