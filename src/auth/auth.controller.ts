import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
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
import { CreateAdminDto } from './dto/create-admin.dto';
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
  ): Promise<{ token: string }> {
    const token = await this.authService.register(dto);
    this.setCookie(res, token);
    return { token };
  }

  @UseGuards(GuestOnlyGuard)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ token: string }> {
    const token = await this.authService.login(dto);
    this.setCookie(res, token);
    return { token };
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
    const cookieToken = (req.cookies?.[COOKIE_NAME] ?? req.cookies?.[ADMIN_COOKIE_NAME]) as string | undefined;
    const authHeader = req.headers?.authorization as string | undefined;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.clearCookie(ADMIN_COOKIE_NAME, { path: '/' });

    // Delete the session for whichever token authenticated this request
    const token = cookieToken ?? bearerToken;
    if (token) {
      await this.authService.logout(token);
    }
  }

  /**
   * Bootstrap — créer un administrateur depuis Insomnia / Postman.
   *
   * Protégé par un header secret :  X-Bootstrap-Key: <ADMIN_BOOTSTRAP_KEY>
   *
   * Exemple Insomnia :
   *   POST http://localhost:3000/api/auth/admin/bootstrap
   *   Header : X-Bootstrap-Key: <valeur de ADMIN_BOOTSTRAP_KEY dans .env>
   *   Body (JSON) :
   *   {
   *     "firstName": "Super",
   *     "lastName": "Admin",
   *     "email": "admin@tumavu.com",
   *     "password": "MotDePasseSecurise123!"
   *   }
   */
  @Post('admin/bootstrap')
  @HttpCode(201)
  createAdmin(
    @Headers('x-bootstrap-key') key: string,
    @Body() dto: CreateAdminDto,
  ) {
    const expected = process.env.ADMIN_BOOTSTRAP_KEY;
    if (!expected || key !== expected) {
      throw new ForbiddenException('Clé bootstrap invalide ou absente');
    }
    return this.authService.createAdmin(dto);
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
