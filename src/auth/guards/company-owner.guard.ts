import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticatedRequestUser } from '../auth-user.interface';

@Injectable()
export class CompanyOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedRequestUser | undefined;

    if (!user) {
      throw new UnauthorizedException('Connexion requise');
    }

    if (!user.isCompanyOwner) {
      throw new ForbiddenException('Route reservee aux company owners');
    }

    return true;
  }
}
