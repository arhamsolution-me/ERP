import {
  Controller, Get, Patch, Post, Param, Body, Req,
  UseGuards, HttpCode, HttpStatus, NotFoundException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import type { AuthenticatedRequest } from '../../common/types/request.types';
import { prisma } from '@repo/db';

@ApiTags('Users')
@ApiBearerAuth('ClerkAuth')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {

  @Get()
  @Permissions('users.read')
  @ApiOperation({ summary: 'List all users in the tenant' })
  @ApiResponse({ status: 200 })
  async findAll(@Req() req: AuthenticatedRequest) {
    return prisma.user.findMany({
      where: { tenant_id: req.tenantId!, deleted_at: null },
      select: {
        id: true, email: true, phone: true, status: true,
        mfa_enabled: true, last_login_at: true, created_at: true,
        user_roles: { include: { role: { select: { name: true } } } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  @Get(':id')
  @Permissions('users.read')
  @ApiOperation({ summary: 'Get a specific user' })
  @ApiResponse({ status: 200 })
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const user = await prisma.user.findFirst({
      where: { id, tenant_id: req.tenantId!, deleted_at: null },
      include: { user_roles: { include: { role: true } } },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Patch(':id')
  @Permissions('users.update')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200 })
  async update(
    @Param('id') id: string,
    @Body() body: { phone?: string; email?: string },
    @Req() req: AuthenticatedRequest,
  ) {
    const user = await prisma.user.findFirst({ where: { id, tenant_id: req.tenantId! } });
    if (!user) throw new NotFoundException('User not found');
    return prisma.user.update({
      where: { id },
      data: { ...body, updated_at: new Date() },
    });
  }

  @Post(':id/suspend')
  @Permissions('users.suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend a user' })
  @ApiResponse({ status: 200 })
  async suspend(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const user = await prisma.user.findFirst({ where: { id, tenant_id: req.tenantId! } });
    if (!user) throw new NotFoundException('User not found');
    return prisma.user.update({
      where: { id },
      data: { status: 'suspended', updated_at: new Date() },
    });
  }

  @Get(':id/sessions')
  @Permissions('users.read')
  @ApiOperation({ summary: 'Get active sessions for a user' })
  @ApiResponse({ status: 200 })
  async getSessions(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return prisma.session.findMany({
      where: { user_id: id, tenant_id: req.tenantId!, revoked_at: null },
      orderBy: { created_at: 'desc' },
    });
  }

  @Post(':id/sessions/:sessionId/revoke')
  @Permissions('users.revoke_session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiResponse({ status: 200 })
  async revokeSession(
    @Param('id') _id: string,
    @Param('sessionId') sessionId: string,
    @Req() _req: AuthenticatedRequest,
  ) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { revoked_at: new Date() },
    });
  }
}
