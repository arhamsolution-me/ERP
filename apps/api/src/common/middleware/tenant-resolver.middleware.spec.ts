import { TenantResolverMiddleware } from './tenant-resolver.middleware';
import { BadRequestException } from '@nestjs/common';
import { prisma } from '@repo/db';
import type { TenantRequest } from '../types/request.types';
import type { Response, NextFunction } from 'express';

jest.mock('@repo/db', () => ({
  prisma: {
    tenant: { findUnique: jest.fn() },
  },
}));

describe('TenantResolverMiddleware Unit Tests', () => {
  let middleware: TenantResolverMiddleware;
  let next: NextFunction;

  beforeEach(() => {
    middleware = new TenantResolverMiddleware();
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should extract tenantId from x-tenant-id header', async () => {
    const req = {
      headers: { 'x-tenant-id': 'tenant-header-123' },
    } as unknown as TenantRequest;
    const res = {} as Response;

    await middleware.use(req, res, next);

    expect(req.tenantId).toBe('tenant-header-123');
    expect(next).toHaveBeenCalled();
  });

  it('should extract tenantId from subdomain when header is missing', async () => {
    (prisma.tenant.findUnique as jest.Mock).mockResolvedValue({
      id: 'tenant-subdomain-456',
      status: 'active',
    });

    const req = {
      headers: { host: 'acme-mills.nexerp.app' },
    } as unknown as TenantRequest;
    const res = {} as Response;

    await middleware.use(req, res, next);

    expect(req.tenantId).toBe('tenant-subdomain-456');
    expect(next).toHaveBeenCalled();
  });

  it('should throw BadRequestException when tenant resolved via subdomain is suspended', async () => {
    (prisma.tenant.findUnique as jest.Mock).mockResolvedValue({
      id: 'tenant-suspended',
      status: 'suspended',
    });

    const req = {
      headers: { host: 'suspended-org.nexerp.app' },
    } as unknown as TenantRequest;
    const res = {} as Response;

    await expect(middleware.use(req, res, next)).rejects.toThrow(BadRequestException);
  });
});
