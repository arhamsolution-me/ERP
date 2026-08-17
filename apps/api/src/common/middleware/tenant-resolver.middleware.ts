import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import type { Response, NextFunction } from 'express';
import { prisma } from '@repo/db';
import type { TenantRequest } from '../types/request.types';

/**
 * TenantResolverMiddleware extracts tenant context from headers or subdomain.
 *
 * SECURITY NOTE (Non-Negotiable Standard #1):
 * No route relies on this middleware alone for security/authorization.
 * Even if an attacker supplies a spoofed `x-tenant-id` header for another tenant,
 * `RolesGuard` mandatory cross-check (`user.tenant_id !== request.tenantId`)
 * rejects the request with HTTP 403 Forbidden.
 */
@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  async use(req: TenantRequest, res: Response, next: NextFunction) {
    const headerTenantId = req.headers['x-tenant-id'] as string;
    const host = req.headers.host || '';
    const subdomainMatch = host.match(/^([^.]+)\./);
    const subdomain = subdomainMatch ? subdomainMatch[1] : null;

    if (headerTenantId) {
      req.tenantId = headerTenantId;
    } else if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
      const tenant = await prisma.tenant.findUnique({
        where: { subdomain },
        select: { id: true, status: true },
      });
      if (tenant) {
        if (tenant.status !== 'active') {
          throw new BadRequestException('Tenant is suspended or inactive.');
        }
        req.tenantId = tenant.id;
        req.tenant = tenant;
      }
    }

    next();
  }
}
