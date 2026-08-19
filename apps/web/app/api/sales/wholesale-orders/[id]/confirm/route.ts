import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@repo/db';
import { createAuditLog } from '@/lib/audit';
import { devStore } from '@/lib/dev-store';
import { isDevStoreFallbackAllowed } from '@/lib/dev-store-guard';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
      const order = await prisma.wholesaleOrder.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order || order.tenant_id !== session.tenantId) {
        throw new Error('Wholesale order not found in database');
      }

      if (order.status !== 'draft') {
        return NextResponse.json({ error: `Cannot confirm order in '${order.status}' status` }, { status: 400 });
      }

      const updated = await prisma.$transaction(async (tx) => {
        // 1. Lock pricing and update status to confirmed
        const confirmedOrder = await tx.wholesaleOrder.update({
          where: { id: order.id },
          data: { status: 'confirmed' },
        });

        // 2. Reserve stock in Warehouse
        const warehouse = await tx.warehouse.findFirst({
          where: { tenant_id: session.tenantId },
        });

        if (warehouse) {
          for (const it of order.items) {
            const sl = await tx.stockLevel.findUnique({
              where: {
                tenant_id_warehouse_id_variant_id: {
                  tenant_id: session.tenantId,
                  warehouse_id: warehouse.id,
                  variant_id: it.variant_id,
                },
              },
            });

            if (sl) {
              await tx.stockLevel.update({
                where: { id: sl.id },
                data: { quantity_reserved: sl.quantity_reserved + it.quantity },
              });
            }
          }
        }

        return confirmedOrder;
      });

      await createAuditLog({
        tenantId: session.tenantId,
        userId: session.userId,
        action: 'WHOLESALE_ORDER_CONFIRMED',
        entityType: 'WholesaleOrder',
        entityId: updated.id,
        afterJson: { status: 'confirmed', totalAmount: updated.total_amount.toString() },
      });

      return NextResponse.json({
        success: true,
        message: 'Wholesale order confirmed and stock reserved',
        order: {
          id: updated.id,
          status: updated.status,
        },
      });
    } catch (dbErr: any) {
      if (!isDevStoreFallbackAllowed()) {
        console.error('[Wholesale Confirm] Database error, no fallback in this environment:', dbErr);
        return NextResponse.json(
          { error: 'A server error occurred. Please try again.' },
          { status: 500 }
        );
      }
      console.warn('[Wholesale Confirm] Database offline, using devStore fallback (non-production only):', dbErr.message);
      const matched = devStore.wholesaleOrders.find((o) => o.id === id);
      if (!matched) {
        return NextResponse.json({ error: 'Order not found in dev store' }, { status: 404 });
      }
      matched.status = 'confirmed';

      return NextResponse.json({
        success: true,
        message: 'Wholesale order confirmed and stock reserved (Dev)',
        order: {
          id: matched.id,
          status: matched.status,
        },
      });
    }
  } catch (error: any) {
    console.error('[Wholesale Order Confirm Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
