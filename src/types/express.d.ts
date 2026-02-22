import { AuthenticatedRequestUser } from '../auth/auth-user.interface';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedRequestUser;
    }
  }
}

export {};
