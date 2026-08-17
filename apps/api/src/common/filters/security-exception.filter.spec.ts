import { SecurityExceptionFilter } from './security-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';

describe('Security Exception Filter & Information Leak Prevention', () => {
  let filter: SecurityExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new SecurityExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockRequest = {
      method: 'POST',
      url: '/api/v1/pos/transactions',
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should handle HttpException and preserve safe client status/message', () => {
    const exception = new HttpException('Invalid tenant credentials', HttpStatus.FORBIDDEN);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Invalid tenant credentials',
        path: '/api/v1/pos/transactions',
      }),
    );
  });

  it('should mask internal DB errors in production and prevent stack trace leaks', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const dbError = new Error('FATAL: password authentication failed for user "postgres"');
    filter.catch(dbError, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'An unexpected error occurred. Incident has been recorded.',
      }),
    );

    process.env.NODE_ENV = originalEnv;
  });
});
