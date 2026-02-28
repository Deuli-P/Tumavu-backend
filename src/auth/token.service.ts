import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

type TokenPayload = {
  sub: string;
  exp: number;
};

// Service de token HMAC (format proche JWT: header.payload.signature).
@Injectable()
export class TokenService {
  readonly ttlSeconds = 60 * 60 * 24; // 24h

  constructor(private readonly configService: ConfigService) {}

  signAuthToken(authId: string): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload: TokenPayload = {
      sub: authId,
      exp: Math.floor(Date.now() / 1000) + this.ttlSeconds,
    };

    const headerPart = this.base64Url(JSON.stringify(header));
    const payloadPart = this.base64Url(JSON.stringify(payload));
    const signature = this.signPart(`${headerPart}.${payloadPart}`);

    return `${headerPart}.${payloadPart}.${signature}`;
  }

  verifyAuthToken(token: string): TokenPayload {
    const [headerPart, payloadPart, signaturePart] = token.split('.');

    if (!headerPart || !payloadPart || !signaturePart) {
      throw new UnauthorizedException('Token invalide');
    }

    const expected = this.signPart(`${headerPart}.${payloadPart}`);
    const valid = this.safeCompare(expected, signaturePart);

    if (!valid) {
      throw new UnauthorizedException('Signature token invalide');
    }

    const payload = JSON.parse(this.fromBase64Url(payloadPart)) as TokenPayload;

    if (!payload.sub || !payload.exp) {
      throw new UnauthorizedException('Payload token invalide');
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Token expire');
    }

    return payload;
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private signPart(content: string): string {
    const secret = this.configService.get<string>('AUTH_TOKEN_SECRET', 'dev-secret-change-me');

    return createHmac('sha256', secret).update(content).digest('base64url');
  }

  private base64Url(value: string): string {
    return Buffer.from(value, 'utf-8').toString('base64url');
  }

  private fromBase64Url(value: string): string {
    return Buffer.from(value, 'base64url').toString('utf-8');
  }

  private safeCompare(a: string, b: string): boolean {
    const first = Buffer.from(a, 'utf-8');
    const second = Buffer.from(b, 'utf-8');

    if (first.length !== second.length) {
      return false;
    }

    return timingSafeEqual(first, second);
  }
}
