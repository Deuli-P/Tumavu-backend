import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { NotificationService } from '../notification/notification.service';
import { MailService } from '../mail/mail.service';
import { CreateInviteDto } from './dto/create-invite.dto';

const INVITE_TTL_DAYS = 7;

@Injectable()
export class InviteService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly notificationService: NotificationService,
    private readonly mailService: MailService,
  ) {}

  async create(managerId: string, dto: CreateInviteDto) {
    // Vérifier que le manager est propriétaire d'une company liée à l'offre
    const offer = await this.databaseService.jobOffer.findFirst({
      where: { id: dto.offerId, deleted: false },
      select: {
        id: true,
        title: true,
        company: { select: { id: true, name: true, ownerId: true } },
      },
    });

    if (!offer) throw new NotFoundException('Offre introuvable');
    if (offer.company.ownerId !== managerId) throw new ForbiddenException('Accès refusé');

    // Annuler les invitations PENDING existantes pour ce couple email/offre
    await this.databaseService.invitation.updateMany({
      where: { email: dto.email, offerId: dto.offerId, status: 'PENDING', deleted: false },
      data: { status: 'CANCELLED' },
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS);

    const invitation = await this.databaseService.invitation.create({
      data: {
        email: dto.email,
        offerId: dto.offerId,
        invitedBy: managerId,
        expiresAt,
      },
      select: {
        id: true,
        token: true,
        email: true,
        expiresAt: true,
      },
    });

    // Récupérer les infos du manager pour l'email
    const manager = await this.databaseService.user.findUnique({
      where: { id: managerId },
      select: { firstName: true, lastName: true },
    });

    // Envoi de l'email (non bloquant en cas d'échec)
    await this.mailService.sendInvitation({
      to: dto.email,
      inviterFirstName: manager?.firstName ?? '',
      inviterLastName: manager?.lastName ?? '',
      companyName: offer.company.name,
      jobTitle: offer.title,
      token: invitation.token,
      expiresAt,
    });

    return invitation;
  }

  async getByToken(token: string) {
    const invitation = await this.databaseService.invitation.findFirst({
      where: { token, deleted: false },
      select: {
        id: true,
        email: true,
        status: true,
        expiresAt: true,
        offer: {
          select: {
            id: true,
            title: true,
            contractType: true,
            company: { select: { name: true } },
          },
        },
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
        offerId: true,
        status: true,
        expiresAt: true,
        email: true,
        invitedBy: true,
        offer: { select: { id: true, title: true } },
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
      where: { userId, offerId: invitation.offerId, deleted: false, status: 'ACTIVE' },
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
            offerId: invitation.offerId,
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
      body: `${workerName} a accepté votre invitation pour le poste «${invitation.offer.title}».`,
      deepLink: `/app/job-offer/${invitation.offerId}`,
      metadata: { offerId: invitation.offerId, workerUserId: userId },
    });

    return { success: true, offerId: invitation.offerId };
  }
}
