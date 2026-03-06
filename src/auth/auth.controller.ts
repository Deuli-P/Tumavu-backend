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
import { AuthenticatedAdminGuard } from './guards/authenticated-admin.guard';
import { GuestOnlyGuard } from './guards/guest-only.guard';
import { GuestOnlyAdminGuard, ADMIN_COOKIE_NAME } from './guards/guest-only-admin.guard';
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

  @UseGuards(GuestOnlyGuard)
  @Post('login/company')
  async loginCompany(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const token = await this.authService.loginCompany(dto);
    this.setCookie(res, token);
  }

  @UseGuards(GuestOnlyAdminGuard)
  @Post('login/admin')
  async loginAdmin(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const token = await this.authService.loginAdmin(dto);
    this.setCookie(res, token, ADMIN_COOKIE_NAME);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('me')
  me(@CurrentUser() user: AuthenticatedRequestUser): Promise<UserInfo> {
    return this.authService.getMe(user.authId);
  }

  @UseGuards(AuthenticatedAdminGuard)
  @Get('me-admin')
  async meAdmin(
    @CurrentUser() user: AuthenticatedRequestUser,
  ): Promise<UserInfo> {
    return this.authService.getMeAdmin(user.authId);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const token = (req.cookies?.[COOKIE_NAME] ?? req.cookies?.[ADMIN_COOKIE_NAME]) as string | undefined;
    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.clearCookie(ADMIN_COOKIE_NAME, { path: '/' });
    if (token) {
      await this.authService.logout(token);
    }
  }

  // ─── Privé ────────────────────────────────────────────────────────────────────

  private setCookie(res: Response, token: string, name: string = COOKIE_NAME): void {
    res.cookie(name, token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: this.tokenService.ttlSeconds * 1000,
      path: '/',
    });
  }
}
