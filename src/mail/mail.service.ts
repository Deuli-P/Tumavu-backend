import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

const FROM = process.env.MAIL_FROM ?? 'Tumavu <noreply@tumavu.fr>';
const APP_URL = (process.env.APP_URL ?? '').trim().replace(/\/+$/, '');

@Injectable()
export class MailService {
  private readonly resend = new Resend(process.env.RESEND_API_KEY);
  private readonly logger = new Logger(MailService.name);

  async sendInvitation(opts: {
    to: string;
    inviterFirstName: string;
    inviterLastName: string;
    companyName: string;
    jobTitle: string;
    token: string;
    expiresAt: Date;
  }) {
    const link = `${APP_URL}/invite/${opts.token}`;
    const expires = opts.expiresAt.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invitation Tumavu</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">

          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:28px 40px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                Tumavu
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:.6px;">
                Invitation de
              </p>
              <p style="margin:0 0 4px;font-size:18px;font-weight:600;color:#111827;">
                ${opts.inviterFirstName} ${opts.inviterLastName}
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#6b7280;">${opts.companyName}</p>

              <p style="margin:0 0 6px;font-size:14px;color:#374151;">
                Vous êtes invité(e) à rejoindre l'équipe pour le poste&nbsp;:
              </p>
              <p style="margin:0 0 28px;font-size:20px;font-weight:700;color:#111827;">
                ${opts.jobTitle}
              </p>

              <a href="${link}"
                 style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;
                        padding:13px 28px;border-radius:8px;font-size:14px;font-weight:600;">
                Voir l'invitation →
              </a>

              <p style="margin:28px 0 0;font-size:12px;color:#9ca3af;">
                Ce lien est valable jusqu'au ${expires}.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:11px;color:#9ca3af;">
                Si vous pensez avoir reçu cet email par erreur, ignorez-le simplement.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      await this.resend.emails.send({
        from: FROM,
        to: opts.to,
        subject: `Invitation à rejoindre ${opts.companyName} — ${opts.jobTitle}`,
        html,
      });
    } catch (err) {
      // On loggue sans faire échouer la requête — l'invitation est créée en base
      this.logger.error(`Failed to send invitation email to ${opts.to}`, err);
    }
  }
}
