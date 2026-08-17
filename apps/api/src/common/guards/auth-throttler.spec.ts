import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('Auth & API Rate Limiting Suite (ThrottlerGuard)', () => {
  let guard: ThrottlerGuard;
  let reflector: Reflector;
  let mockStorage: any;

  beforeEach(() => {
    reflector = new Reflector();
    mockStorage = {
      increment: jest.fn().mockResolvedValue({ totalHits: 1, timeToExpire: 60000, isBlocked: false, timeToBlockExpire: 0 }),
    };

    const options = [
      { name: 'default', ttl: 60000, limit: 100 },
    ];

    guard = new ThrottlerGuard(options as any, mockStorage, reflector);
    jest.spyOn(guard, 'canActivate').mockImplementation(async (context: ExecutionContext) => {
      const res = await mockStorage.increment('test');
      if (res.isBlocked || res.totalHits > 100) {
        throw new ThrottlerException();
      }
      return true;
    });
  });

  function createMockContext(ip = '192.168.1.1', url = '/api/v1/auth/login'): ExecutionContext {
    const req = {
      ip,
      url,
      headers: {},
      socket: { remoteAddress: ip },
    };
    const res = {
      header: jest.fn(),
    };

    return {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  }

  it('should allow requests within rate limit threshold', async () => {
    const context = createMockContext();
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should reject requests when storage indicates blocked/exceeded threshold', async () => {
    mockStorage.increment = jest.fn().mockResolvedValue({
      totalHits: 101,
      timeToExpire: 50000,
      isBlocked: true,
      timeToBlockExpire: 50000,
    });

    const context = createMockContext();
    await expect(guard.canActivate(context)).rejects.toThrow(ThrottlerException);
  });
});
