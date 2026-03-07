import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostVisibility } from '@prisma/client';

const POST_SELECT = {
  id: true,
  title: true,
  content: true,
  imageUrl: true,
  link: true,
  visibility: true,
  createdAt: true,
  author: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      photoPath: true,
    },
  },
  company: {
    select: { id: true, name: true },
  },
} as const;

@Injectable()
export class PostService {
  constructor(private readonly db: DatabaseService) {}

  async create(userId: string, dto: CreatePostDto) {
    // Si l'auteur est manager, on récupère sa company pour le champ companyId
    const company = await this.db.company.findFirst({
      where: { ownerId: userId, deleted: false },
      select: { id: true },
    });

    return this.db.post.create({
      data: {
        authorId: userId,
        companyId: company?.id ?? null,
        title: dto.title,
        content: dto.content,
        imageUrl: dto.imageUrl,
        link: dto.link,
        visibility: dto.visibility ?? PostVisibility.PUBLIC,
      },
      select: POST_SELECT,
    });
  }

  // Posts visibles par l'utilisateur courant :
  // - tous les posts PUBLIC
  // - les posts COMPANY dont la companyId correspond à une company où le user travaille
  async getFeed(userId: string) {
    const userJobCompanyIds = await this.db.userJob.findMany({
      where: { userId, deleted: false },
      select: { offer: { select: { companyId: true } } },
    });

    const companyIds = userJobCompanyIds
      .map((uj) => uj.offer?.companyId)
      .filter((id): id is string => !!id);

    // Inclure aussi les companies dont l'user est owner
    const ownedCompanies = await this.db.company.findMany({
      where: { ownerId: userId, deleted: false },
      select: { id: true },
    });
    const allCompanyIds = [...new Set([...companyIds, ...ownedCompanies.map((c) => c.id)])];

    return this.db.post.findMany({
      where: {
        deleted: false,
        OR: [
          { visibility: PostVisibility.PUBLIC },
          {
            visibility: PostVisibility.COMPANY,
            companyId: { in: allCompanyIds },
          },
        ],
      },
      select: POST_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const post = await this.db.post.findFirst({
      where: { id, deleted: false },
      select: POST_SELECT,
    });
    if (!post) throw new NotFoundException('Post introuvable');
    return post;
  }

  async remove(userId: string, id: number): Promise<void> {
    const post = await this.db.post.findFirst({
      where: { id, deleted: false },
      select: { authorId: true },
    });
    if (!post) throw new NotFoundException('Post introuvable');
    if (post.authorId !== userId) throw new ForbiddenException('Accès refusé');

    await this.db.post.update({ where: { id }, data: { deleted: true } });
  }
}
