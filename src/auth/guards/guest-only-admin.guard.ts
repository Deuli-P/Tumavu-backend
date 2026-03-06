import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../token.service';
import { DatabaseService } from '../../database/database.service';

export const ADMIN_COOKIE_NAME = 'auth_token_admin';

@Injectable()
export class GuestOnlyAdminGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly databaseService: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;

    if (!token) return true;

    try {
      this.tokenService.verifyAuthToken(token);
    } catch {
      return true;
    }

    const tokenHash = this.tokenService.hashToken(token);
    const session = await this.databaseService.session.findUnique({
      where: { tokenHash },
      select: { expiresAt: true },
    });

    if (!session || session.expiresAt < new Date()) return true;

    throw new UnauthorizedException('Vous êtes déjà connecté');
  }
}
