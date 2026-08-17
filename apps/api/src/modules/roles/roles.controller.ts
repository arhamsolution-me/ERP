import {
  Controller, Get, Post, Patch, Param, Body,
  Req, UseGuards, NotFoundException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import type { AuthenticatedRequest } from '../../common/types/request.types';
import { prisma } from '@repo/db';

@ApiTags('Roles')
@ApiBearerAuth('ClerkAuth')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Controller('roles')
export class RolesController {

  @Get()
  @Permissions('roles.read')
  @ApiOperation({ summary: 'List all roles in the tenant' })
  @ApiResponse({ status: 200 })
  async findAll(@Req() req: AuthenticatedRequest) {
    return prisma.role.findMany({
      where: { tenant_id: req.tenantId!, deleted_at: null },
      include: { role_perms: { include: { permission: true } } },
      orderBy: { name: 'asc' },
    });
  }

  @Post()
  @Permissions('roles.create')
  @ApiOperation({ summary: 'Create a custom role' })
  @ApiResponse({ status: 201 })
  async create(
    @Body() body: { name: string; description?: string },
    @Req() req: AuthenticatedRequest,
  ) {
    return prisma.role.create({
      data: {
        tenant_id: req.tenantId!,
        name: body.name,
        description: body.description,
        is_system_role: false,
      },
    });
  }

  @Patch(':id/permissions')
  @Permissions('roles.update')
  @ApiOperation({ summary: 'Assign permissions to a role' })
  @ApiResponse({ status: 200 })
  async updatePermissions(
    @Param('id') id: string,
    @Body() body: { permissionIds: string[] },
    @Req() req: AuthenticatedRequest,
  ) {
    const role = await prisma.role.findFirst({ where: { id, tenant_id: req.tenantId! } });
    if (!role) throw new NotFoundException('Role not found');

    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { role_id: id } }),
      prisma.rolePermission.createMany({
        data: body.permissionIds.map(pid => ({ role_id: id, permission_id: pid })),
        skipDuplicates: true,
      }),
    ]);

    return prisma.role.findUnique({
      where: { id },
      include: { role_perms: { include: { permission: true } } },
    });
  }
}
