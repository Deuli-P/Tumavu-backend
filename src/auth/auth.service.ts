import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

export type CreateUserResponse = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  // Cree un compte auth + son profil user dans une transaction.
  // Important: en prod il faudra hasher le mot de passe avant insertion.
  async createUser(dto: CreateUserDto): Promise<CreateUserResponse> {
    const created = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existingAuth = await tx.auth.findUnique({
        where: { email: dto.email },
        select: { id: true },
      });

      if (existingAuth) {
        throw new ConflictException('Email deja utilise');
      }

      return tx.auth.create({
        data: {
          email: dto.email,
          password: dto.password,
          user: {
            create: {
              firstName: dto.firstName,
              lastName: dto.lastName,
              photo_path: dto.photoPath ?? null,
            },
          },
        },
        select: {
          id: true,
          email: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    });

    return {
      id: created.id,
      email: created.email,
      firstName: created.user?.firstName ?? null,
      lastName: created.user?.lastName ?? null,
    };
  }
}
