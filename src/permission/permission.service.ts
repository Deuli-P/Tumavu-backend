import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePermissionDto } from './dto/create-permission.dto';

export type PermissionItem = {
  id: number;
  value: string;
  createdAt: string;
  roles: { id: number; value: string; type: string }[];
};

export type RoleWithPermissions = {
  id: number;
  value: string;
  type: string;
  permissions: { id: number; value: string }[];
};

@Injectable()
export class PermissionService {
  constructor(private readonly databaseService: DatabaseService) {}

  async listPermissions(): Promise<PermissionItem[]> {
    const perms = await this.databaseService.permission.findMany({
      select: {
        id: true,
        value: true,
        createdAt: true,
        roles: {
          where: { deleted: false },
          select: { role: { select: { id: true, value: true, type: true } } },
        },
      },
      orderBy: { value: 'asc' },
    });

    return perms.map((p) => ({
      id: p.id,
      value: p.value,
      createdAt: p.createdAt.toISOString(),
      roles: p.roles.map((r) => r.role),
    }));
  }

  async createPermission(dto: CreatePermissionDto): Promise<PermissionItem> {
    const existing = await this.databaseService.permission.findFirst({
      where: { value: dto.value },
      select: { id: true },
    });
    if (existing) throw new ConflictException('Cette permission existe déjà');

    const perm = await this.databaseService.permission.create({
      data: { value: dto.value },
      select: { id: true, value: true, createdAt: true },
    });

    return { ...perm, createdAt: perm.createdAt.toISOString(), roles: [] };
  }

  async listRoles(): Promise<RoleWithPermissions[]> {
    const roles = await this.databaseService.role.findMany({
      select: {
        id: true,
        value: true,
        type: true,
        permissions: {
          where: { deleted: false },
          select: { permission: { select: { id: true, value: true } } },
        },
      },
      orderBy: { id: 'asc' },
    });

    return roles.map((r) => ({
      id: r.id,
      value: r.value,
      type: r.type,
      permissions: r.permissions.map((p) => p.permission),
    }));
  }

  async assignPermissionToRole(roleId: number, permissionId: number): Promise<void> {
    const [role, permission] = await Promise.all([
      this.databaseService.role.findUnique({ where: { id: roleId }, select: { id: true } }),
      this.databaseService.permission.findUnique({ where: { id: permissionId }, select: { id: true } }),
    ]);
    if (!role) throw new NotFoundException('Rôle introuvable');
    if (!permission) throw new NotFoundException('Permission introuvable');

    await this.databaseService.permissionRole.upsert({
      where: { roleId_permissionId: { roleId, permissionId } },
      update: { deleted: false },
      create: { roleId, permissionId },
    });
  }

  async removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
    await this.databaseService.permissionRole.updateMany({
      where: { roleId, permissionId },
      data: { deleted: true },
    });
  }
}
