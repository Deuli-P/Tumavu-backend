import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

type UploadBody = Buffer | Uint8Array | ArrayBuffer | Blob | string;

@Injectable()
export class SupabaseStorageService {
  private readonly defaultBucket: string;
  private readonly supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL', '');
    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY', '');
    this.defaultBucket = this.configService.get<string>('SUPABASE_STORAGE_BUCKET', 'public');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new InternalServerErrorException(
        'SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent etre definis',
      );
    }

    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  async uploadFile(
    objectPath: string,
    file: UploadBody,
    options?: { bucket?: string; contentType?: string; upsert?: boolean },
  ): Promise<{ publicUrl: string }> {
    const bucket = options?.bucket ?? this.defaultBucket;
    const normalizedPath = this.toStoragePath(objectPath, bucket);
    const upsert = options?.upsert ?? true;

    const { error } = await this.supabase.storage.from(bucket).upload(normalizedPath, this.toFileBody(file), {
      contentType: options?.contentType,
      upsert,
    });

    if (error) {
      throw new InternalServerErrorException(
        `Erreur upload Supabase (${error.name}): ${error.message}`,
      );
    }

    const publicUrl = this.getPublicUrl(normalizedPath, { bucket });
    return {
      publicUrl,
    };
  }

  async deleteFile(objectPath: string, options?: { bucket?: string }): Promise<void> {
    const bucket = options?.bucket ?? this.defaultBucket;
    const normalizedPath = this.toStoragePath(objectPath, bucket);

    const { error } = await this.supabase.storage.from(bucket).remove([normalizedPath]);

    if (error) {
      throw new InternalServerErrorException(
        `Erreur delete Supabase (${error.name}): ${error.message}`,
      );
    }
  }

  getPublicUrl(objectPath: string, options?: { bucket?: string }): string {
    const bucket = options?.bucket ?? this.defaultBucket;
    const normalizedPath = this.toStoragePath(objectPath, bucket);
    const {
      data: { publicUrl },
    } = this.supabase.storage.from(bucket).getPublicUrl(normalizedPath);
    return publicUrl;
  }

  private toStoragePath(path: string, bucket: string): string {
    const normalizedPath = path.replace(/^\/+/, '');
    const bucketPrefix = `${bucket}/`;
    if (normalizedPath.startsWith(bucketPrefix)) {
      return normalizedPath.slice(bucketPrefix.length);
    }
    return normalizedPath;
  }

  private toFileBody(file: UploadBody): Blob | ArrayBuffer | Uint8Array | string {
    if (typeof file === 'string') {
      return file;
    }

    if (file instanceof Blob) {
      return file;
    }

    if (file instanceof ArrayBuffer) {
      return new Uint8Array(file);
    }

    return file;
  }
}
