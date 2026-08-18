import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@repo/db';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity, reason } = await req.json();

    const qty = parseInt(quantity, 10);
    if (!productId || isNaN(qty) || qty <= 0) {
      return NextResponse.json({ error: 'Valid product and positive quantity required' }, { status: 400 });
    }

    const variant = await prisma.productVariant.findFirst({
      where: { product_id: productId, tenant_id: session.tenantId },
    });

    if (!variant) {
      return NextResponse.json({ error: 'Product variant not found' }, { status: 404 });
    }

    const warehouse = await prisma.warehouse.findFirst({
      where: { tenant_id: session.tenantId },
    });

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      const stockLevel = await tx.stockLevel.findUnique({
        where: {
          tenant_id_warehouse_id_variant_id: {
            tenant_id: session.tenantId,
            warehouse_id: warehouse.id,
            variant_id: variant.id,
          },
        },
      });

      if (!stockLevel || stockLevel.quantity_on_hand < qty) {
        throw new Error('Insufficient stock quantity available');
      }

      // 1. Deduct Stock Level
      await tx.stockLevel.update({
        where: { id: stockLevel.id },
        data: { quantity_on_hand: stockLevel.quantity_on_hand - qty },
      });

      // 2. Add Stock Movement Record
      await tx.stockMovement.create({
        data: {
          tenant_id: session.tenantId,
          warehouse_id: warehouse.id,
          variant_id: variant.id,
          movement_type: 'outbound',
          quantity: qty,
          reference_type: reason || 'STOCK_OUT',
          moved_by: session.userId,
        },
      });
    });

    await createAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'STOCK_OUT',
      entityType: 'ProductVariant',
      entityId: variant.id,
      afterJson: { productId, deductedQuantity: qty, reason },
    });

    return NextResponse.json({ success: true, message: `Successfully deducted ${qty} units from stock` });
  } catch (error: any) {
    console.error('[Stock Out POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
