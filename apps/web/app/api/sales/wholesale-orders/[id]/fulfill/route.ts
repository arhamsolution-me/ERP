import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@repo/db';
import { createAuditLog } from '@/lib/audit';
import { devStore } from '@/lib/dev-store';

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

      if (order.status !== 'confirmed') {
        return NextResponse.json(
          { error: `Cannot fulfill order in '${order.status}' status (must be 'confirmed')` },
          { status: 400 }
        );
      }

      const updated = await prisma.$transaction(async (tx) => {
        // 1. Update status to fulfilled
        const fulfilledOrder = await tx.wholesaleOrder.update({
          where: { id: order.id },
          data: { status: 'fulfilled' },
        });

        // 2. Decrement physical stock on hand and remove reservation
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
              const newOnHand = Math.max(0, sl.quantity_on_hand - it.quantity);
              const newReserved = Math.max(0, sl.quantity_reserved - it.quantity);

              await tx.stockLevel.update({
                where: { id: sl.id },
                data: {
                  quantity_on_hand: newOnHand,
                  quantity_reserved: newReserved,
                },
              });
            }

            // 3. Log Immutable Stock Movement
            await tx.stockMovement.create({
              data: {
                tenant_id: session.tenantId,
                warehouse_id: warehouse.id,
                variant_id: it.variant_id,
                movement_type: 'sale',
                quantity: it.quantity,
                reference_type: 'WHOLESALE_ORDER',
                reference_id: order.id,
                moved_by: session.userId,
              },
            });
          }
        }

        return fulfilledOrder;
      });

      await createAuditLog({
        tenantId: session.tenantId,
        userId: session.userId,
        action: 'WHOLESALE_ORDER_FULFILLED',
        entityType: 'WholesaleOrder',
        entityId: updated.id,
        afterJson: { status: 'fulfilled', totalAmount: updated.total_amount.toString() },
      });

      return NextResponse.json({
        success: true,
        message: 'Wholesale order fulfilled and stock deducted successfully',
        order: {
          id: updated.id,
          status: updated.status,
        },
      });
    } catch (dbErr: any) {
      console.warn('[Wholesale Fulfill] Database offline, fulfilling devStore order:', dbErr.message);
      const matched = devStore.wholesaleOrders.find((o) => o.id === id);
      if (!matched) {
        return NextResponse.json({ error: 'Order not found in dev store' }, { status: 404 });
      }
      matched.status = 'fulfilled';

      // Deduct stock in devStore
      for (const it of matched.items) {
        const prod = devStore.products.find((p) => p.variants.some((v) => v.id === it.variantId));
        if (prod) {
          prod.totalQuantity = Math.max(0, prod.totalQuantity - it.quantity);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Wholesale order fulfilled and stock deducted successfully (Dev)',
        order: {
          id: matched.id,
          status: matched.status,
        },
      });
    }
  } catch (error: any) {
    console.error('[Wholesale Order Fulfill Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
