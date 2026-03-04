import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersService, AdminUserItem } from './users.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ListUsersAdminDto } from './dto/list-users-admin.dto';

@UseGuards(AuthenticatedGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('admin')
  @UseGuards(AdminGuard)
  listUsersAdmin(@Query() query: ListUsersAdminDto): Promise<AdminUserItem[]> {
    return this.usersService.listUsersAdmin(query);
  }

  @Get('admin/countries')
  @UseGuards(AdminGuard)
  listUsersAdminCountries(): Promise<string[]> {
    return this.usersService.listUsersAdminCountries();
  }

  @Post()
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateUserDto: Prisma.UserUpdateInput
) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
