import { RolesController } from './roles.controller';
import { prisma } from '@repo/db';
import type { AuthenticatedRequest } from '../../common/types/request.types';

jest.mock('@repo/db', () => ({
  prisma: {
    role: { findMany: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
    rolePermission: { deleteMany: jest.fn(), createMany: jest.fn() },
    $transaction: jest.fn((promises) => Promise.all(promises)),
  },
}));

describe('RolesController Unit Tests', () => {
  let controller: RolesController;
  const mockReq = { tenantId: 'tenant-1' } as unknown as AuthenticatedRequest;

  beforeEach(() => {
    controller = new RolesController();
    jest.clearAllMocks();
  });

  it('should list all roles in tenant', async () => {
    (prisma.role.findMany as jest.Mock).mockResolvedValue([{ id: 'r-1', name: 'Cashier' }]);
    const result = await controller.findAll(mockReq);
    expect(result).toHaveLength(1);
  });

  it('should create custom role', async () => {
    (prisma.role.create as jest.Mock).mockResolvedValue({ id: 'r-custom', name: 'Weaver Supervisor' });
    const result = await controller.create({ name: 'Weaver Supervisor' }, mockReq);
    expect(result.name).toBe('Weaver Supervisor');
  });

  it('should update role permissions', async () => {
    (prisma.role.findFirst as jest.Mock).mockResolvedValue({ id: 'r-1' });
    (prisma.role.findUnique as jest.Mock).mockResolvedValue({ id: 'r-1', name: 'Cashier', role_perms: [] });
    const result = await controller.updatePermissions('r-1', { permissionIds: ['p-1', 'p-2'] }, mockReq);
    expect(result.id).toBe('r-1');
  });
});
