import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { prisma } from '@repo/db';
import type { AuthenticatedRequest } from '../types/request.types';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<AuthenticatedRequest>();
    const method = req.method?.toUpperCase();

    // Only audit mutating state requests (POST, PUT, PATCH, DELETE)
    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    if (!isMutating || !req.tenantId) {
      return next.handle();
    }

    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || null;
    const deviceFingerprint = (req.headers['x-device-fingerprint'] as string) || (req.headers['user-agent'] as string) || null;
    const path = req.path || req.url;
    const action = `${method} ${path}`;

    return next.handle().pipe(
      tap({
        next: async (data: any) => {
          try {
            // Find entity ID if present in response object or body
            let entityId: string | null = null;
            if (data && typeof data === 'object' && typeof data.id === 'string') {
              entityId = data.id;
            } else if (req.params?.id) {
              const rawParam = req.params.id;
              entityId = Array.isArray(rawParam) ? rawParam[0] : (rawParam as string);
            }

            // Derive entity type from route path segment
            const segments = path.split('/').filter(Boolean);
            const entityType = segments.length > 0 ? segments[segments.length - 1] : 'unknown';

            // If entityId is not a valid UUID, generate or omit
            const isValidUuid = entityId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(entityId);

            if (isValidUuid) {
              await prisma.auditLog.create({
                data: {
                  tenant_id: req.tenantId!,
                  user_id: req.auth?.userId ? undefined : undefined, // clerk_id is string; user_id is uuid
                  action,
                  entity_type: entityType || 'general',
                  entity_id: entityId!,
                  after_json: data && typeof data === 'object' ? data : undefined,
                  ip_address: ipAddress ? String(ipAddress).slice(0, 45) : null,
                  device_fingerprint: deviceFingerprint ? String(deviceFingerprint).slice(0, 255) : null,
                },
              });
            }
          } catch (err: any) {
            this.logger.warn(`AuditLog write deferred or skipped: ${err?.message}`);
          }
        },
      }),
    );
  }
}
