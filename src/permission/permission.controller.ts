import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PermissionService, PermissionItem, RoleWithPermissions } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Controller('permission')
@UseGuards(AuthenticatedGuard, AdminGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  listPermissions(): Promise<PermissionItem[]> {
    return this.permissionService.listPermissions();
  }

  @Post()
  createPermission(@Body() dto: CreatePermissionDto): Promise<PermissionItem> {
    return this.permissionService.createPermission(dto);
  }

  @Get('roles')
  listRoles(): Promise<RoleWithPermissions[]> {
    return this.permissionService.listRoles();
  }

  @Post('role/:roleId/permission/:permissionId')
  assignPermission(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ): Promise<void> {
    return this.permissionService.assignPermissionToRole(roleId, permissionId);
  }

  @Delete('role/:roleId/permission/:permissionId')
  removePermission(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ): Promise<void> {
    return this.permissionService.removePermissionFromRole(roleId, permissionId);
  }
}
