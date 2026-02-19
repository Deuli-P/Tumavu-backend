import { Body, Controller, Post } from '@nestjs/common';
import { AuthService, CreateUserResponse } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';

// Endpoint d'inscription.
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/auth/create-user
  // Lit les infos depuis le body JSON, valide le payload via CreateUserDto,
  // puis cree les enregistrements dans auth + users.
  @Post('create-user')
  async createUser(@Body() dto: CreateUserDto): Promise<CreateUserResponse> {
    return this.authService.createUser(dto);
  }
}
