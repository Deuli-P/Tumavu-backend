import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService, UserInfo } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedRequestUser } from './auth-user.interface';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { GuestOnlyGuard } from './guards/guest-only.guard';
import { TokenService } from './token.service';

const COOKIE_NAME = 'auth_token';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @UseGuards(GuestOnlyGuard)
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const  token  = await this.authService.register(dto);
    return this.setCookie(res, token);
  }

  @UseGuards(GuestOnlyGuard)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const token = await this.authService.login(dto);
    return this.setCookie(res, token);
    ;
  }

  @UseGuards(AuthenticatedGuard)
  @Get('me')
  me(@CurrentUser() user: AuthenticatedRequestUser): Promise<UserInfo> {
    return this.authService.getMe(user.authId);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const token = req.cookies?.[COOKIE_NAME] as string | undefined;
    res.clearCookie(COOKIE_NAME, { path: '/' });
    if (token) {
      await this.authService.logout(token);
    }
  }

  // ─── Privé ────────────────────────────────────────────────────────────────────

  private setCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: false,            // en dev HTTP
    sameSite: 'lax',          // ok si on corrige le proxy (voir plus bas)
    maxAge: this.tokenService.ttlSeconds * 1000,
    path: '/',
  });
}
}
