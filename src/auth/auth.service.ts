import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
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
  user: {
    id: string;
    email: string;
    firstName: string;
    photoPath?: string | null;
    lastName: string;
    role: {
      id: number;
    };
  };
  company?: {
    id: number;
    name: string;
    owner_id: string;
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
        email: dto.email.toLowerCase().trim(),
        password: passwordHash,
        user: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            roleId: defaultRole?.id,
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
            roleId: true,
            companies: {
              where: { deleted: false },
              select: {
                id: true,
                ownerId: true,
                description: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    let fullPath: string | undefined;

    if (file && created.user) {
      try {
        const extension = file.mimetype.split('/')[1] || 'jpg';
        const timestamp = Date.now();

        const storagePath = `${created.user.id}/photo/photo_${timestamp}.${extension}`;

        await this.storageService.uploadFile(storagePath, file.buffer, {
          contentType: file.mimetype,
        });

        fullPath = storagePath;

        // Update user avec chemin photo
        await this.databaseService.user.update({
          where: { id: created.user.id },
          data: { photoPath: fullPath },
        });

      } catch (error) {
        console.error('Erreur upload photo:', error);
      }
    }

    return this.buildAuthPayload(created);
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
            roleId: true,
            companies: {
              where: { deleted: false },
              select: {
                id: true,
                ownerId: true,
                description: true,
              },
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
      roleId: number | null;
      companies?: Array<{ id: number; ownerId: string | null; description: string | null }>;
    } | null;
  }): AuthPayload {
    if (!auth.user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    const company = auth.user.companies?.[0] ?? null;

    return {
      token: this.tokenService.signAuthToken(auth.id),
      user: {
        id: auth.user.id,
        email: auth.email,
        firstName: auth.user.firstName,
        photoPath: auth.user.photoPath,
        lastName: auth.user.lastName,
        role: {
          id: auth.user.roleId ?? 0,
        },
      },
      company: company
        ? {
            id: company.id,
            name: company.description ?? '',
            owner_id: company.ownerId,
          }
        : null,
    };
  }
}
