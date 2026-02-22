import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequestUser } from '../auth-user.interface';

// Permet de recuperer facilement req.user dans les controllers.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedRequestUser | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthenticatedRequestUser | undefined;
  },
);
