import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { NotificationType } from '@prisma/client';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { Subject } from 'rxjs';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  deepLink?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly expo = new Expo();

  // userId → Subject for SSE streams
  private readonly streams = new Map<string, Subject<MessageEvent>>();

  constructor(private readonly db: DatabaseService) {}

  // ─── Internal: create + push ───────────────────────────────────────────────

  async create(dto: CreateNotificationDto) {
    const notification = await this.db.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        body: dto.body,
        deepLink: dto.deepLink,
        metadata: dto.metadata ? (dto.metadata as object) : undefined,
      },
    });

    this.pushToStream(dto.userId, notification);
    await this.sendExpoPush(dto.userId, dto.title, dto.body, dto.deepLink);

    return notification;
  }

  // ─── REST: list ─────────────────────────────────────────────────────────

  async findAllForUser(userId: string) {
    return this.db.notification.findMany({
      where: { userId, deleted: false },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string) {
    return this.db.notification.count({
      where: { userId, read: false, deleted: false },
    });
  }

  // ─── REST: mark read ────────────────────────────────────────────────────

  async markRead(userId: string, notificationId: number) {
    return this.db.notification.updateMany({
      where: { id: notificationId, userId, deleted: false },
      data: { read: true, readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    return this.db.notification.updateMany({
      where: { userId, read: false, deleted: false },
      data: { read: true, readAt: new Date() },
    });
  }

  // ─── Expo push tokens ───────────────────────────────────────────────────

  async registerToken(userId: string, token: string, deviceId?: string) {
    if (!Expo.isExpoPushToken(token)) {
      throw new Error(`Invalid Expo push token: ${token}`);
    }

    if (deviceId) {
      // Upsert: update existing token for this device or create new
      const existing = await this.db.expoPushToken.findFirst({
        where: { userId, deviceId, deleted: false },
      });

      if (existing) {
        return this.db.expoPushToken.update({
          where: { id: existing.id },
          data: { token },
        });
      }
    }

    // Check if token already registered (different device or no deviceId)
    const byToken = await this.db.expoPushToken.findUnique({
      where: { token },
    });

    if (byToken) {
      if (byToken.deleted) {
        return this.db.expoPushToken.update({
          where: { id: byToken.id },
          data: { deleted: false, userId, deviceId },
        });
      }
      return byToken;
    }

    return this.db.expoPushToken.create({
      data: { userId, token, deviceId },
    });
  }

  async removeToken(token: string) {
    return this.db.expoPushToken.updateMany({
      where: { token },
      data: { deleted: true },
    });
  }

  // ─── SSE ────────────────────────────────────────────────────────────────

  getStream(userId: string): Subject<MessageEvent> {
    if (!this.streams.has(userId)) {
      this.streams.set(userId, new Subject<MessageEvent>());
    }
    return this.streams.get(userId)!;
  }

  closeStream(userId: string) {
    const subject = this.streams.get(userId);
    if (subject) {
      subject.complete();
      this.streams.delete(userId);
    }
  }

  private pushToStream(userId: string, data: unknown) {
    const subject = this.streams.get(userId);
    if (subject) {
      subject.next({ data } as MessageEvent);
    }
  }

  // ─── Internal: send Expo push ────────────────────────────────────────────

  private async sendExpoPush(userId: string, title: string, body?: string, deepLink?: string) {
    const tokens = await this.db.expoPushToken.findMany({
      where: { userId, deleted: false },
      select: { token: true },
    });

    if (!tokens.length) return;

    const messages: ExpoPushMessage[] = tokens
      .filter((t) => Expo.isExpoPushToken(t.token))
      .map((t) => ({
        to: t.token,
        title,
        body,
        data: deepLink ? { deepLink } : undefined,
        sound: 'default' as const,
      }));

    if (!messages.length) return;

    try {
      const chunks = this.expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        const receipts = await this.expo.sendPushNotificationsAsync(chunk);
        // Log tickets with errors for future receipt handling
        for (const receipt of receipts) {
          if (receipt.status === 'error') {
            this.logger.warn(`Expo push error: ${receipt.message}`, receipt.details);
          }
        }
      }
    } catch (err) {
      this.logger.error('Failed to send Expo push notifications', err);
    }
  }
}
