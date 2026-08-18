import { prisma } from '@repo/db';

export interface AuditLogOptions {
  tenantId: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  beforeJson?: any;
  afterJson?: any;
  ipAddress?: string | null;
  deviceFingerprint?: string | null;
}

/**
 * Creates an immutable audit log entry in the PostgreSQL database.
 */
export async function createAuditLog(opts: AuditLogOptions) {
  try {
    return await prisma.auditLog.create({
      data: {
        tenant_id: opts.tenantId,
        user_id: opts.userId || null,
        action: opts.action,
        entity_type: opts.entityType,
        entity_id: opts.entityId,
        before_json: opts.beforeJson ? JSON.parse(JSON.stringify(opts.beforeJson)) : undefined,
        after_json: opts.afterJson ? JSON.parse(JSON.stringify(opts.afterJson)) : undefined,
        ip_address: opts.ipAddress || null,
        device_fingerprint: opts.deviceFingerprint || null,
      },
    });
  } catch (error) {
    console.error('[AuditLog Write Error]:', error);
    // Non-blocking catch to ensure operational continuity, but logged
    return null;
  }
}
