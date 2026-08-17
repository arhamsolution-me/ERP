import { ClerkAuthGuard } from './clerk-auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { verifyToken } from '@clerk/clerk-sdk-node';

jest.mock('@clerk/clerk-sdk-node', () => ({
  verifyToken: jest.fn(),
}));

describe('ClerkAuthGuard Unit Tests', () => {
  let guard: ClerkAuthGuard;

  beforeEach(() => {
    guard = new ClerkAuthGuard();
    jest.clearAllMocks();
  });

  function createMockContext(headers: Record<string, string>): { context: ExecutionContext; req: any } {
    const req = { headers, auth: null };
    const context = {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as unknown as ExecutionContext;
    return { context, req };
  }

  it('should throw UnauthorizedException when authorization header is missing', async () => {
    const { context } = createMockContext({});
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when header does not start with Bearer', async () => {
    const { context } = createMockContext({ authorization: 'Basic 12345' });
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should attach user and session info when token is verified successfully', async () => {
    (verifyToken as jest.Mock).mockResolvedValue({
      sub: 'user_clerk_123',
      sid: 'sess_clerk_456',
    });

    const { context, req } = createMockContext({ authorization: 'Bearer valid_jwt_token' });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(req.auth).toEqual({
      userId: 'user_clerk_123',
      sessionId: 'sess_clerk_456',
    });
  });

  it('should throw UnauthorizedException when verifyToken fails', async () => {
    (verifyToken as jest.Mock).mockRejectedValue(new Error('Invalid signature'));
    const { context } = createMockContext({ authorization: 'Bearer bad_token' });
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
