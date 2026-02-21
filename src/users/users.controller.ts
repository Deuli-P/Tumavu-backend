import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Controller('users')
export class UsersController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Post()
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.databaseService.user.create({ data: createUserDto });
  }

  @Get()
  findAll() {
    return this.databaseService.user.findMany();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.databaseService.user.findUnique({ where: { id: id } });
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateUserDto: Prisma.UserUpdateInput
) {
    return this.databaseService.user.update({ where: { id:id }, data: updateUserDto });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.databaseService.user.delete({ where: { id: id } });
  }
}
