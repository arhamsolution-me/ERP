import { UsersController } from './users.controller';
import { prisma } from '@repo/db';
import type { AuthenticatedRequest } from '../../common/types/request.types';

jest.mock('@repo/db', () => ({
  prisma: {
    user: { findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    session: { findMany: jest.fn(), update: jest.fn() },
  },
}));

describe('UsersController Unit Tests', () => {
  let controller: UsersController;
  const mockReq = { tenantId: 'tenant-1' } as unknown as AuthenticatedRequest;

  beforeEach(() => {
    controller = new UsersController();
    jest.clearAllMocks();
  });

  it('should list all active users in tenant', async () => {
    (prisma.user.findMany as jest.Mock).mockResolvedValue([{ id: 'u-1', email: 'staff@nexerp.app' }]);
    const result = await controller.findAll(mockReq);
    expect(result).toHaveLength(1);
  });

  it('should get a specific user', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'u-1', email: 'staff@nexerp.app' });
    const result = await controller.findOne('u-1', mockReq);
    expect(result.email).toBe('staff@nexerp.app');
  });

  it('should suspend a user', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'u-1' });
    (prisma.user.update as jest.Mock).mockResolvedValue({ id: 'u-1', status: 'suspended' });
    const result = await controller.suspend('u-1', mockReq);
    expect(result.status).toBe('suspended');
  });

  it('should list and revoke active user sessions', async () => {
    (prisma.session.findMany as jest.Mock).mockResolvedValue([{ id: 's-1' }]);
    const list = await controller.getSessions('u-1', mockReq);
    expect(list).toHaveLength(1);

    (prisma.session.update as jest.Mock).mockResolvedValue({ id: 's-1', revoked_at: new Date() });
    const revoked = await controller.revokeSession('u-1', 's-1', mockReq);
    expect(revoked.revoked_at).toBeDefined();
  });
});
