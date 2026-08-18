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

    const { productId, quantity, notes } = await req.json();

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
      // 1. Update or create StockLevel
      const stockLevel = await tx.stockLevel.findUnique({
        where: {
          tenant_id_warehouse_id_variant_id: {
            tenant_id: session.tenantId,
            warehouse_id: warehouse.id,
            variant_id: variant.id,
          },
        },
      });

      if (stockLevel) {
        await tx.stockLevel.update({
          where: { id: stockLevel.id },
          data: { quantity_on_hand: stockLevel.quantity_on_hand + qty },
        });
      } else {
        await tx.stockLevel.create({
          data: {
            tenant_id: session.tenantId,
            warehouse_id: warehouse.id,
            variant_id: variant.id,
            quantity_on_hand: qty,
          },
        });
      }

      // 2. Add Stock Movement Record
      await tx.stockMovement.create({
        data: {
          tenant_id: session.tenantId,
          warehouse_id: warehouse.id,
          variant_id: variant.id,
          movement_type: 'inbound',
          quantity: qty,
          reference_type: 'STOCK_IN',
          moved_by: session.userId,
        },
      });
    });

    await createAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'STOCK_IN',
      entityType: 'ProductVariant',
      entityId: variant.id,
      afterJson: { productId, addedQuantity: qty, notes },
    });

    return NextResponse.json({ success: true, message: `Successfully added ${qty} units to stock` });
  } catch (error: any) {
    console.error('[Stock In POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
