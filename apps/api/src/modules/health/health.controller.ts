import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../../app.controller';
import { prisma } from '@repo/db';

@ApiTags('Health & Probes')
@Controller()
export class HealthController {
  
  @Public()
  @Get(['health', 'healthz'])
  @ApiOperation({ summary: 'Liveness probe for container orchestrator' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  getLiveness(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      status: 'ok',
      service: 'nexerp-api',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }

  @Public()
  @Get(['ready', 'readyz'])
  @ApiOperation({ summary: 'Readiness probe checking database connectivity' })
  @ApiResponse({ status: 200, description: 'Service is ready to serve traffic' })
  @ApiResponse({ status: 503, description: 'Dependency check failed' })
  async getReadiness(@Res() res: Response) {
    try {
      // Test database connectivity
      await prisma.$queryRaw`SELECT 1`;

      return res.status(HttpStatus.OK).json({
        status: 'ok',
        service: 'nexerp-api',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'error',
        service: 'nexerp-api',
        database: 'disconnected',
        error: err?.message || 'Database ping failed',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
