import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../../app.controller';
import type { AuthenticatedRequest } from '../types/request.types';
import { prisma } from '@repo/db';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip guard for @Public() routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      throw new ForbiddenException('Route requires explicit permissions definition');
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.auth || !request.auth.userId) {
      throw new UnauthorizedException('User is not authenticated');
    }

    if (!request.tenantId) {
      throw new ForbiddenException('Tenant context is required for authorization');
    }

    const user = await prisma.user.findUnique({
      where: { clerk_id: request.auth.userId },
      include: {
        user_roles: {
          include: {
            role: {
              include: {
                role_perms: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.status !== 'active') {
      throw new ForbiddenException('User is not registered or is inactive in this tenant');
    }

    if (user.tenant_id !== request.tenantId) {
      throw new ForbiddenException('User does not belong to the requested tenant context');
    }

    const userPermissions = new Set<string>();
    for (const ur of user.user_roles) {
      for (const rp of ur.role.role_perms) {
        userPermissions.add(rp.permission.code);
      }
    }

    const hasAllPermissions = requiredPermissions.every(perm => userPermissions.has(perm));
    if (!hasAllPermissions) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
