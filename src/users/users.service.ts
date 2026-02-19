import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Type de reponse renvoye par notre endpoint.
// On expose firstname/lastname pour coller a la demande metier.
export type ActiveUserResponse = {
  id: string;
  firstname: string | null;
  lastname: string | null;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Exemple Prisma de A a Z:
  // 1) lit la table "users" (via le model User)
  // 2) applique le filtre SQL: WHERE deleted = false
  // 3) select uniquement id, firstname, lastname
  // 4) mappe la reponse pour l'API
  async findActiveUsers(): Promise<ActiveUserResponse[]> {
    const users = await this.prisma.user.findMany({
      where: {
        deleted: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    return users.map((user) => ({
      id: user.id,
      firstname: user.firstName,
      lastname: user.lastName,
    }));
  }
}
