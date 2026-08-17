import { AuditInterceptor } from './audit.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { prisma } from '@repo/db';

jest.mock('@repo/db', () => ({
  prisma: {
    auditLog: {
      create: jest.fn(),
    },
  },
}));

describe('AuditInterceptor Unit Tests', () => {
  let interceptor: AuditInterceptor;

  beforeEach(() => {
    interceptor = new AuditInterceptor();
    jest.clearAllMocks();
  });

  function createMockContext(req: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as unknown as ExecutionContext;
  }

  it('should skip non-mutating GET requests', (done) => {
    const req = { method: 'GET', tenantId: 'tenant-1', url: '/api/v1/pos/terminals' };
    const context = createMockContext(req);
    const next: CallHandler = { handle: () => of({ data: [] }) };

    interceptor.intercept(context, next).subscribe(() => {
      expect(prisma.auditLog.create).not.toHaveBeenCalled();
      done();
    });
  });

  it('should record audit log on mutating POST request with valid UUID entity', (done) => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    const req = {
      method: 'POST',
      tenantId: '123e4567-e89b-12d3-a456-426614174001',
      url: '/api/v1/pos/transactions',
      headers: { 'user-agent': 'Mozilla/5.0' },
    };
    const context = createMockContext(req);
    const next: CallHandler = { handle: () => of({ id: validUuid, total: 1000 }) };

    interceptor.intercept(context, next).subscribe(() => {
      setTimeout(() => {
        expect(prisma.auditLog.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              action: 'POST /api/v1/pos/transactions',
              entity_id: validUuid,
            }),
          }),
        );
        done();
      }, 20);
    });
  });
});
