import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTaskDto } from './dto/create-task.dto';

const TASK_SELECT = {
  id: true,
  title: true,
  description: true,
  priority: true,
  dueDate: true,
  done: true,
  createdAt: true,
  company: { select: { id: true, name: true } },
  creator: { select: { firstName: true, lastName: true } },
} as const;

@Injectable()
export class TaskService {
  constructor(private readonly db: DatabaseService) {}

  // Manager crée une tâche pour sa company
  async create(managerId: string, dto: CreateTaskDto) {
    const company = await this.db.company.findFirst({
      where: { ownerId: managerId, deleted: false },
      select: { id: true },
    });
    if (!company) throw new ForbiddenException('Aucune entreprise associée');

    return this.db.task.create({
      data: {
        companyId: company.id,
        createdBy: managerId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      select: TASK_SELECT,
    });
  }

  // Worker voit les tâches de toutes ses companies actives
  async findWorkerTasks(userId: string) {
    const userJobs = await this.db.userJob.findMany({
      where: { userId, deleted: false, status: 'ACTIVE' },
      select: { offer: { select: { companyId: true } } },
    });

    const companyIds = [...new Set(userJobs.map((uj) => uj.offer.companyId))];
    if (companyIds.length === 0) return [];

    return this.db.task.findMany({
      where: { companyId: { in: companyIds }, deleted: false },
      select: TASK_SELECT,
      orderBy: [{ done: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  // Manager liste les tâches de sa company
  async findCompanyTasks(managerId: string) {
    const company = await this.db.company.findFirst({
      where: { ownerId: managerId, deleted: false },
      select: { id: true },
    });
    if (!company) throw new ForbiddenException('Aucune entreprise associée');

    return this.db.task.findMany({
      where: { companyId: company.id, deleted: false },
      select: TASK_SELECT,
      orderBy: [{ done: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  // Manager marque une tâche comme faite/non faite
  async toggleDone(managerId: string, taskId: number) {
    const task = await this.checkManagerOwnership(managerId, taskId);
    return this.db.task.update({
      where: { id: taskId },
      data: { done: !task.done },
      select: TASK_SELECT,
    });
  }

  // Manager supprime une tâche
  async remove(managerId: string, taskId: number) {
    await this.checkManagerOwnership(managerId, taskId);
    await this.db.task.update({ where: { id: taskId }, data: { deleted: true } });
  }

  private async checkManagerOwnership(managerId: string, taskId: number) {
    const company = await this.db.company.findFirst({
      where: { ownerId: managerId, deleted: false },
      select: { id: true },
    });
    if (!company) throw new ForbiddenException('Aucune entreprise associée');

    const task = await this.db.task.findFirst({
      where: { id: taskId, companyId: company.id, deleted: false },
      select: { done: true },
    });
    if (!task) throw new NotFoundException('Tâche introuvable');
    return task;
  }
}
