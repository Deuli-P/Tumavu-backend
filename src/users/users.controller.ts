import { Controller, Get } from '@nestjs/common';
import { ActiveUserResponse, UsersService } from './users.service';

// Controller HTTP dedie aux users.
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/users/active
  // Retourne uniquement les users non supprimes (deleted = false)
  // avec les champs id, firstname, lastname.
  @Get('active')
  async getActiveUsers(): Promise<ActiveUserResponse[]> {
    return this.usersService.findActiveUsers();
  }
}
