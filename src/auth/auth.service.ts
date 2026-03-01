import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { LoginAs, LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

export type UserInfo = {
  id: string;
  info: {
    firstName: string;
    lastName: string;
    city: string | null;
    postalCode: string | null;
    country: string | null;
    photoUrl: string | null;
    email: string;
    createdAt: string;
    role: { id: number; value: string; type: string };
    phone: string | null;
  };
  company: {
    name: string;
    phone: string | null;
    type: string | null;
    address: { locality: string; street: string; country: string };
  } | null;
  setup: {
    language: { code: string; id: number };
    notifications: boolean;
  };
};

// Retourné uniquement en interne vers le controller pour poser le cookie.
export type AuthResult = { token: string; user: UserInfo };

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto): Promise<string> {
    // Vérification mot de passes identiques
    if (dto.password !== dto.confirmedPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    // Check si email déjà utilisé (soft delete ignoré)
    const existing = await this.databaseService.auth.findFirst({
      where: { email: dto.email, deleted: false },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Une erreur est survenue lors de la création du compte');
    }
    // Récupération du hash du mot de passe et du rôle par défaut en parallèle
    const [passwordHash, defaultRole] = await Promise.all([
      this.passwordService.hash(dto.password),
      this.databaseService.role.findFirstOrThrow({
        where: { type: 'USER' },
        select: { id: true },
      }),
    ]);

    const authId = randomUUID();
    await this.databaseService.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: authId,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          city: dto.address.city,
          postalCode: dto.address.postal_code,
          country: dto.address.country ?? null,
          roleId: defaultRole.id,
        },
      });
      await tx.auth.create({
        data: {
          id: authId,
          email: dto.email.toLowerCase().trim(),
          password: passwordHash,
        },
      });
    });

    // Création de la session et construction de l'objet utilisateur.
    const token = this.tokenService.signAuthToken(authId);
    await this.saveSession(authId, token);
    const user = await this.buildUserInfo(authId);
    return token;
  };

  async login(dto: LoginDto): Promise<string> {
    const loginAs: LoginAs = dto.as ?? 'USER';

    const credentials = await this.databaseService.auth.findFirst({
      where: { email: dto.email, deleted: false },
      select: { id: true, password: true },
    });
    if (!credentials) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    const passwordOk = await this.passwordService.verify(dto.password, credentials.password);
    if (!passwordOk) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    const userRow = await this.databaseService.user.findFirst({
      where: { id: credentials.id, deleted: false },
      select: { roleId: true },
    });
    if (!userRow) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    const [isAdmin, ownedCount] = await Promise.all([
      this.hasAdminRole(userRow.roleId),
      this.databaseService.company.count({ where: { ownerId: credentials.id, deleted: false } }),
    ]);
    this.assertLoginAs(loginAs, isAdmin, ownedCount > 0);

    // Révoque l'ancienne session et met à jour la date de connexion.
    await this.databaseService.$transaction([
      this.databaseService.session.deleteMany({ where: { authId: credentials.id } }),
      this.databaseService.auth.update({
        where: { id: credentials.id },
        data: { lastSignInAt: new Date() },
      }),
    ]);

    const token = this.tokenService.signAuthToken(credentials.id);
    await this.saveSession(credentials.id, token);
    return token;
  }

  async getMe(authId: string): Promise<UserInfo> {
    return this.buildUserInfo(authId);
  }

  async logout(token: string): Promise<void> {
    const tokenHash = this.tokenService.hashToken(token);
    await this.databaseService.session.deleteMany({ where: { tokenHash } });
  }

  // ─── Privé ────────────────────────────────────────────────────────────────────

  private assertLoginAs(loginAs: LoginAs, isAdmin: boolean, isCompanyOwner: boolean): void {
    if (loginAs === 'USER' && isAdmin) {
      throw new ForbiddenException('Utilisez le portail administrateur pour vous connecter');
    }
    if (loginAs === 'USER' && isCompanyOwner) {
      throw new ForbiddenException('Utilisez le portail entreprise pour vous connecter');
    }
    if (loginAs === 'MANAGER' && !isCompanyOwner) {
      throw new ForbiddenException('Aucune entreprise associée à ce compte');
    }
    if (loginAs === 'ADMIN' && !isAdmin) {
      throw new ForbiddenException('Accès administrateur refusé');
    }
  }

  private async hasAdminRole(roleId: number | null): Promise<boolean> {
    if (!roleId) return false;
    const role = await this.databaseService.role.findFirst({
      where: { id: roleId },
      select: { type: true },
    });
    return role?.type === 'ADMIN';
  }

  private async saveSession(authId: string, token: string): Promise<void> {
    const tokenHash = this.tokenService.hashToken(token);
    const expiresAt = new Date(Date.now() + this.tokenService.ttlSeconds * 1000);
    await this.databaseService.session.create({
      data: { authId, tokenHash, expiresAt },
    });
  }

  private async buildUserInfo(authId: string): Promise<UserInfo> {
    const auth = await this.databaseService.auth.findFirst({
      where: { id: authId, deleted: false },
      select: {
        id: true,
        email: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoPath: true,
            phone: true,
            city: true,
            postalCode: true,
            country: true,
            notifications: true,
            role: { select: { id: true, value: true, type: true } },
            language: { select: { id: true, code: true } },
            companies: {
              where: { deleted: false },
              select: {
                name: true,
                phone: true,
                type: true,
                address: {
                  select: {
                    locality: true,
                    street: true,
                    country: { select: { name: true } },
                  },
                },
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!auth?.user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    const { user } = auth;
    if (!user.firstName || !user.lastName) {
      throw new UnauthorizedException('Profil utilisateur incomplet');
    }

    const company = user.companies[0] ?? null;

    return {
      id: user.id,
      info: {
        firstName: user.firstName,
        lastName: user.lastName,
        city: user.city,
        postalCode: user.postalCode,
        country: user.country,
        photoUrl: user.photoPath,
        email: auth.email,
        createdAt: auth.createdAt.toISOString(),
        role: { id: user.role.id, value: user.role.value, type: user.role.type },
        phone: user.phone,
      },
      company: company
        ? {
            name: company.name,
            phone: company.phone,
            type: company.type,
            address: {
              locality: company.address.locality,
              street: company.address.street,
              country: company.address.country.name,
            },
          }
        : null,
      setup: {
        language: {
          code: user.language?.code ?? 'fr',
          id: user.language?.id ?? 1,
        },
        notifications: user.notifications,
      },
    };
  }
}
