import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { SupabaseStorageService } from '../storage/supabase-storage.service';

type UploadedPhoto = {
  buffer: Buffer;
  mimetype: string;
  originalname?: string;
  size?: number;
};

export type AuthPayload = {
  token: string;
  userLogged: {
    id: string;
    info: {
      firstName: string;
      lastName: string;
      city: string | null;
      postalCode: string | null;
      country: string | null;
      photoUrl: string | null;
      email: string;
      created_at: string;
      phone: string | null;
    };
    company: {
      name: string;
      phone: string | null;
      type: string | null;
      address: {
        city: string;
        street: string;
        postalCode: string;
        country: string;
      };
    } | null;
    setup: {
      language: {
        code: string;
        id: number;
      };
      notifications: boolean;
    };
  };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  async register(dto: RegisterDto, file?: UploadedPhoto): Promise<AuthPayload> {
    if (dto.password !== dto.confirmedPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    const existing = await this.databaseService.auth.findFirst({
      where: { email: dto.email, deleted: false },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Email deja utilise');
    }

    const passwordHash = await this.passwordService.hash(dto.password);
    const defaultRole = await this.databaseService.role.findFirst({
      where: { label: 'USER', deleted: false },
      select: { id: true },
    });

    const created = await this.databaseService.auth.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        password: passwordHash,
        user: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            city: dto.address.city,
            roleId: defaultRole?.id,
          },
        },
      },
      select: { id: true, user: { select: { id: true } } },
    });

    if (file && created.user) {
      try {
        const extension = file.mimetype.split('/')[1] || 'jpg';
        const storagePath = `${created.user.id}/photo/photo_${Date.now()}.${extension}`;

        await this.storageService.uploadFile(storagePath, file.buffer, {
          contentType: file.mimetype,
        });

        await this.databaseService.user.update({
          where: { id: created.user.id },
          data: { photoPath: storagePath },
        });
      } catch (error) {
        console.error('Erreur upload photo:', error);
      }
    }

    const payload = await this.getMe(created.id);
    await this.saveSession(created.id, payload.token);
    return payload;
  }

  async login(dto: LoginDto): Promise<AuthPayload> {
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

    // Révoque l'ancienne session et met à jour la date de connexion.
    await this.databaseService.$transaction([
      this.databaseService.session.deleteMany({ where: { authId: credentials.id } }),
      this.databaseService.auth.update({
        where: { id: credentials.id },
        data: { lastSignInAt: new Date() },
      }),
    ]);

    const payload = await this.getMe(credentials.id);
    await this.saveSession(credentials.id, payload.token);
    return payload;
  }

  async logout(token: string): Promise<void> {
    const tokenHash = this.tokenService.hashToken(token);
    await this.databaseService.session.deleteMany({ where: { tokenHash } });
  }

  private async saveSession(authId: string, token: string): Promise<void> {
    const tokenHash = this.tokenService.hashToken(token);
    const expiresAt = new Date(Date.now() + this.tokenService.ttlSeconds * 1000);
    await this.databaseService.session.create({
      data: { authId, tokenHash, expiresAt },
    });
  }

  async getMe(authId: string): Promise<AuthPayload> {
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
            language: { select: { id: true, code: true } },
            notifications: true,
            companies: {
              where: { deleted: false },
              select: {
                description: true,
                phone: true,
                type: true,
                address: {
                  select: {
                    city: true,
                    street: true,
                    zipCode: true,
                    country: true,
                  },
                },
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!auth || !auth.user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    const { user } = auth;
    const firstName = user.firstName;
    const lastName = user.lastName;

    if (!firstName || !lastName) {
      throw new UnauthorizedException('Profil utilisateur incomplet');
    }

    const company = user.companies[0] ?? null;
    const photoExt = user.photoPath?.split('.').pop() ?? null;

    return {
      token: this.tokenService.signAuthToken(auth.id),
      userLogged: {
        id: user.id,
        info: {
          firstName,
          lastName,
          city: user.city,
          photoUrl:user.photoPath,
          postalCode: user.postalCode,
          country: user.country,
          email: auth.email,
          created_at: auth.createdAt.toISOString(),
          phone: user.phone,
        },
        company: company
          ? {
              name: company.description ?? '',
              phone: company.phone,
              type: company.type,
              address: {
                city: company.address.city,
                street: company.address.street,
                postalCode: company.address.zipCode,
                country: company.address.country,
              },
            }
          : null,
        setup: {
          language: {
            code : user.language?.code ?? 'FR',
            id: user.language?.id ?? 1,
          },
          notifications: user.notifications,
        },
      },
    };
  }
}
