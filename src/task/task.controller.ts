import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/auth-user.interface';

@Controller('task')
@UseGuards(AuthenticatedGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // Manager crée une tâche
  @Post()
  create(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: CreateTaskDto) {
    return this.taskService.create(user.userId, dto);
  }

  // Worker : tâches de ses companies
  @Get('worker')
  findWorkerTasks(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.taskService.findWorkerTasks(user.userId);
  }

  // Manager : tâches de sa company
  @Get('company')
  findCompanyTasks(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.taskService.findCompanyTasks(user.userId);
  }

  // Manager toggle done
  @Patch(':id/done')
  @HttpCode(200)
  toggleDone(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.taskService.toggleDone(user.userId, id);
  }

  // Manager supprime
  @Delete(':id')
  @HttpCode(204)
  remove(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.taskService.remove(user.userId, id);
  }
}
