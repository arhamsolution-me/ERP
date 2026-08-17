import { HealthController } from './health.controller';
import { prisma } from '@repo/db';
import type { Response } from 'express';

jest.mock('@repo/db', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

describe('HealthController Unit Tests', () => {
  let controller: HealthController;

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(() => {
    controller = new HealthController();
    jest.clearAllMocks();
  });

  it('should return 200 OK for liveness probe', () => {
    const res = mockResponse();
    controller.getLiveness(res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'ok', service: 'nexerp-api' }));
  });

  it('should return 200 OK for readiness probe when DB is healthy', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ 1: 1 }]);
    const res = mockResponse();
    await controller.getReadiness(res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'ok', database: 'connected' }));
  });

  it('should return 503 SERVICE_UNAVAILABLE for readiness probe when DB fails', async () => {
    (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('Connection timeout'));
    const res = mockResponse();
    await controller.getReadiness(res);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'error', database: 'disconnected' }));
  });
});
