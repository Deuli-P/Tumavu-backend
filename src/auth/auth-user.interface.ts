// Contexte utilisateur injecte dans req.user apres verification du token.
export interface AuthenticatedRequestUser {
  authId: string;
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isCompanyOwner: boolean;
  isAdmin: boolean;
}
