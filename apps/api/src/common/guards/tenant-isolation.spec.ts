import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { prisma } from '@repo/db';

jest.mock('@repo/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Tenant Isolation & RBAC Security Suite (RolesGuard)', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
    jest.clearAllMocks();
  });

  function createMockContext(req: any, isPublic = false, permissions: string[] = ['pos.sale.create']): ExecutionContext {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key: string) => {
      if (key === 'isPublic') return isPublic;
      if (key === 'permissions') return permissions;
      return undefined;
    });

    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  }

  it('should allow access to @Public() routes without authentication', async () => {
    const context = createMockContext({}, true);
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException when request lacks authenticated user (req.auth.userId)', async () => {
    const context = createMockContext({
      auth: null,
      tenantId: 'tenant-123',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw ForbiddenException when request lacks tenant context (req.tenantId)', async () => {
    const context = createMockContext({
      auth: { userId: 'clerk_user_1' },
      tenantId: null,
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('CRITICAL: should throw 403 Forbidden when a user attempts cross-tenant access via header spoofing', async () => {
    // User actually belongs to tenant-A in the database
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'db-user-1',
      clerk_id: 'clerk_user_1',
      tenant_id: 'tenant-A-legitimate',
      status: 'active',
      user_roles: [
        {
          role: {
            role_perms: [{ permission: { code: 'pos.sale.create' } }],
          },
        },
      ],
    });

    // Attacker sends x-tenant-id for tenant-B
    const spoofedContext = createMockContext({
      auth: { userId: 'clerk_user_1' },
      tenantId: 'tenant-B-victim',
    });

    await expect(guard.canActivate(spoofedContext)).rejects.toThrow(
      new ForbiddenException('User does not belong to the requested tenant context'),
    );
  });

  it('should throw 403 Forbidden when user has insufficient permissions', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'db-user-1',
      clerk_id: 'clerk_user_1',
      tenant_id: 'tenant-A',
      status: 'active',
      user_roles: [
        {
          role: {
            role_perms: [{ permission: { code: 'pos.sale.read' } }], // lacks pos.sale.create
          },
        },
      ],
    });

    const context = createMockContext({
      auth: { userId: 'clerk_user_1' },
      tenantId: 'tenant-A',
    }, false, ['pos.sale.create']);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new ForbiddenException('Insufficient permissions'),
    );
  });

  it('should allow access when user matches tenant and holds all required permissions', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'db-user-1',
      clerk_id: 'clerk_user_1',
      tenant_id: 'tenant-A',
      status: 'active',
      user_roles: [
        {
          role: {
            role_perms: [{ permission: { code: 'pos.sale.create' } }],
          },
        },
      ],
    });

    const context = createMockContext({
      auth: { userId: 'clerk_user_1' },
      tenantId: 'tenant-A',
    }, false, ['pos.sale.create']);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });
});
