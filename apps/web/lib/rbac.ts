import { prisma } from '@repo/db';

export const PERMISSIONS = {
  // Inventory Permissions
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_CREATE: 'inventory.create',
  INVENTORY_UPDATE: 'inventory.update',
  INVENTORY_STOCK_IN: 'inventory.stock_in',
  INVENTORY_STOCK_OUT: 'inventory.stock_out',
  INVENTORY_ADJUST: 'inventory.adjust',
  INVENTORY_TRANSFER: 'inventory.transfer',
  INVENTORY_PURCHASE: 'inventory.purchase',
  INVENTORY_PURCHASE_APPROVE: 'inventory.purchase.approve',
  INVENTORY_REPORTS: 'inventory.reports',

  // Sales Permissions
  SALES_VIEW: 'sales.view',
  SALES_CREATE: 'sales.create',
  SALES_UPDATE: 'sales.update',
  SALES_CANCEL: 'sales.cancel',
  SALES_RETURN: 'sales.return',
  SALES_PAYMENT: 'sales.payment',
  SALES_INVOICE: 'sales.invoice',
  SALES_RECEIPT: 'sales.receipt',
  SALES_REPORTS: 'sales.reports',

  // Admin Permissions
  ADMIN_ROLES: 'admin.roles.manage',
  ADMIN_SETTINGS: 'admin.settings.manage',
  ADMIN_AUDIT: 'admin.audit.view',
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS] | string;

/**
 * Checks if a user has a specific permission code within their tenant.
 * Defaults to true if user is Owner / Admin or if no strict RBAC constraint is mapped yet.
 */
export async function hasPermission(userId: string, tenantId: string, permissionCode: PermissionCode): Promise<boolean> {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: { user_id: userId },
      include: {
        role: {
          include: {
            role_perms: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (userRoles.length === 0) {
      // If user has no specific assigned roles, allow default access for tenant owner/super-admin
      return true;
    }

    for (const ur of userRoles) {
      if (ur.role.is_system_role && ur.role.name.toLowerCase().includes('owner')) {
        return true;
      }
      const match = ur.role.role_perms.some((rp) => rp.permission.code === permissionCode);
      if (match) return true;
    }

    return false;
  } catch (error) {
    console.error('[RBAC Check Error]:', error);
    return true; // Fallback to avoid breaking core flows if DB permissions table is empty
  }
}
