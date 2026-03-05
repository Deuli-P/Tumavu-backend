import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class InviteService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly notificationService: NotificationService,
  ) {}

  async getByToken(token: string) {
    const invitation = await this.databaseService.invitation.findFirst({
      where: { token, deleted: false },
      select: {
        id: true,
        email: true,
        status: true,
        expiresAt: true,
        job: { select: { id: true, title: true, contractType: true } },
        inviter: { select: { firstName: true, lastName: true } },
      },
    });

    if (!invitation) throw new NotFoundException('Invitation introuvable');

    if (invitation.status === 'ACCEPTED') {
      return { ...invitation, valid: false, reason: 'already_accepted' as const };
    }

    if (invitation.status === 'CANCELLED' || invitation.status === 'EXPIRED') {
      return { ...invitation, valid: false, reason: 'expired' as const };
    }

    if (new Date() > invitation.expiresAt) {
      await this.databaseService.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      return { ...invitation, valid: false, reason: 'expired' as const };
    }

    return { ...invitation, valid: true, reason: null };
  }

  async accept(token: string, userId: string) {
    const invitation = await this.databaseService.invitation.findFirst({
      where: { token, deleted: false },
      select: {
        id: true,
        jobId: true,
        status: true,
        expiresAt: true,
        email: true,
        invitedBy: true,
        job: { select: { id: true, title: true } },
      },
    });

    if (!invitation) throw new NotFoundException('Invitation introuvable');
    if (invitation.status === 'ACCEPTED') throw new BadRequestException('Invitation déjà acceptée');
    if (invitation.status !== 'PENDING') throw new BadRequestException('Invitation expirée ou annulée');
    if (new Date() > invitation.expiresAt) {
      await this.databaseService.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Invitation expirée');
    }

    // Check if already assigned
    const existing = await this.databaseService.userJob.findFirst({
      where: { userId, jobId: invitation.jobId, deleted: false, status: 'ACTIVE' },
    });

    // Fetch worker name for notification
    const worker = await this.databaseService.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });

    await this.databaseService.$transaction(async (tx) => {
      if (!existing) {
        await tx.userJob.create({
          data: {
            userId,
            jobId: invitation.jobId,
            assignedBy: userId,
            status: 'ACTIVE',
          },
        });
      }

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED', userId, acceptedAt: new Date() },
      });
    });

    // Notifier le manager (invitant) que son invitation a été acceptée
    const workerName = worker ? `${worker.firstName} ${worker.lastName}` : invitation.email;
    await this.notificationService.create({
      userId: invitation.invitedBy,
      type: 'INVITATION_RECEIVED',
      title: 'Invitation acceptée',
      body: `${workerName} a accepté votre invitation pour le poste «${invitation.job.title}».`,
      deepLink: `/app/jobs/${invitation.jobId}`,
      metadata: { jobId: invitation.jobId, workerUserId: userId },
    });

    return { success: true, jobId: invitation.jobId };
  }
}
