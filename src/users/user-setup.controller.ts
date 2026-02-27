import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/auth-user.interface';
import { UsersService } from './users.service';
import { UpdateLanguageDto } from './dto/update-language.dto';

@Controller('user/setup')
@UseGuards(AuthenticatedGuard)
export class UserSetupController {
  constructor(private readonly usersService: UsersService) {}

  @Put('language')
  updateLanguage(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: UpdateLanguageDto,
  ): Promise<void> {
    return this.usersService.updateLanguage(user.userId, dto.language);
  }
}
