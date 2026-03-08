import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SupabaseStorageService } from '../storage/supabase-storage.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostVisibility } from '@prisma/client';

const PHOTO_BUCKET = 'media';
const MAX_PHOTOS = 5;

const POST_SELECT = {
  id: true,
  title: true,
  content: true,
  imageUrls: true,
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
  constructor(
    private readonly db: DatabaseService,
    private readonly storage: SupabaseStorageService,
  ) {}

  async create(userId: string, dto: CreatePostDto) {
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
        link: dto.link,
        visibility: dto.visibility ?? PostVisibility.PUBLIC,
        imageUrls: [],
      },
      select: POST_SELECT,
    });
  }

  // Upload des photos après création du post.
  // Chemin Supabase : posts/{postId}/photo-{index}.jpg
  async addPhotos(userId: string, postId: number, files: Express.Multer.File[]) {
    const post = await this.db.post.findFirst({
      where: { id: postId, deleted: false },
      select: { authorId: true, imageUrls: true },
    });

    if (!post) throw new NotFoundException('Post introuvable');
    if (post.authorId !== userId) throw new ForbiddenException('Accès refusé');
    if (files.length === 0) throw new BadRequestException('Aucun fichier fourni');
    if (post.imageUrls.length + files.length > MAX_PHOTOS) {
      throw new BadRequestException(`Maximum ${MAX_PHOTOS} photos par post`);
    }

    const startIndex = post.imageUrls.length;
    const urls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.mimetype === 'image/png' ? 'png' : 'jpg';
      const path = `posts/${postId}/photo-${startIndex + i}.${ext}`;

      const { publicUrl } = await this.storage.uploadFile(path, file.buffer, {
        bucket: PHOTO_BUCKET,
        contentType: file.mimetype,
        upsert: false,
      });

      urls.push(publicUrl);
    }

    const updated = await this.db.post.update({
      where: { id: postId },
      data: { imageUrls: { push: urls } },
      select: POST_SELECT,
    });

    return updated;
  }

  async getFeed(userId: string) {
    const userJobCompanyIds = await this.db.userJob.findMany({
      where: { userId, deleted: false },
      select: { offer: { select: { companyId: true } } },
    });

    const companyIds = userJobCompanyIds
      .map((uj) => uj.offer?.companyId)
      .filter((id): id is string => !!id);

    const ownedCompanies = await this.db.company.findMany({
      where: { ownerId: userId, deleted: false },
      select: { id: true },
    });
    const allCompanyIds = [...new Set([...companyIds, ...ownedCompanies.map((c) => c.id)])];

    const posts = await this.db.post.findMany({
      where: {
        deleted: false,
        OR: [
          { visibility: PostVisibility.PUBLIC },
          { visibility: PostVisibility.COMPANY, companyId: { in: allCompanyIds } },
        ],
      },
      select: {
        ...POST_SELECT,
        reads: { where: { userId }, select: { readAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return posts.map(({ reads, ...post }) => ({
      ...post,
      isRead: reads.length > 0,
    }));
  }

  async findOne(userId: string, id: number) {
    const post = await this.db.post.findFirst({
      where: { id, deleted: false },
      select: POST_SELECT,
    });
    if (!post) throw new NotFoundException('Post introuvable');

    await this.db.postRead.upsert({
      where: { postId_userId: { postId: id, userId } },
      create: { postId: id, userId },
      update: {},
    });

    return { ...post, isRead: true };
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
