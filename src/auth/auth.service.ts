import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

export type AuthPayload = {
  token: string;
  user: {
    authId: string;
    userId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    isCompanyOwner: boolean;
    isAdmin: boolean;
  };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthPayload> {
    const existing = await this.databaseService.auth.findFirst({
      where: { email: dto.email, deleted: false },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Email deja utilise');
    }

    const passwordHash = await this.passwordService.hash(dto.password);
    const defaultRole = await this.databaseService.role.findFirst({
      where: {
        label: 'USER',
        deleted: false,
      },
      select: { id: true },
    });

    const created = await this.databaseService.auth.create({
      data: {
        email: dto.email,
        password: passwordHash,
        user: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            photoPath: dto.photoPath ?? null,
            roleId: defaultRole?.id ?? 1
          },
        },
      },
      select: {
        id: true,
        email: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return this.buildAuthPayload(created, false);
  }

  async login(dto: LoginDto): Promise<AuthPayload> {
    const auth = await this.databaseService.auth.findFirst({
      where: { email: dto.email, deleted: false },
      select: {
        id: true,
        email: true,
        password: true,
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
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    const passwordOk = await this.passwordService.verify(dto.password, auth.password);
    if (!passwordOk) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    await this.databaseService.auth.update({
      where: { id: auth.id },
      data: { lastSignInAt: new Date() },
    });

    return this.buildAuthPayload(auth);
  }

  private buildAuthPayload(auth: {
    id: string;
    email: string;
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      companies?: Array<{ id: number }>;
    } | null;
  }, isCompanyOwnerOverride?: boolean): AuthPayload {
    if (!auth.user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    return {
      token: this.tokenService.signAuthToken(auth.id),
      user: {
        authId: auth.id,
        userId: auth.user.id,
        email: auth.email,
        firstName: auth.user.firstName,
        lastName: auth.user.lastName,
        isCompanyOwner: isCompanyOwnerOverride ?? (auth.user.companies?.length ?? 0) > 0,
        isAdmin: adminEmails.includes(auth.email.toLowerCase()),
      },
    };
  }
}
