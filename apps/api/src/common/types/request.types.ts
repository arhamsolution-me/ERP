import type { Request } from 'express';

export interface TenantRequest extends Request {
  tenantId?: string;
  tenant?: any;
}

export interface AuthenticatedRequest extends TenantRequest {
  auth?: {
    userId: string;
    sessionId: string;
  };
}
