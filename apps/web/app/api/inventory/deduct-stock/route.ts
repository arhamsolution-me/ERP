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

    const { items, saleReferenceId } = await req.json(); // items: Array<{ productId: string, quantity: number }>

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 });
    }

    const warehouse = await prisma.warehouse.findFirst({
      where: { tenant_id: session.tenantId },
    });

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const variant = await tx.productVariant.findFirst({
          where: { product_id: item.productId, tenant_id: session.tenantId },
          include: { product: true },
        });

        if (!variant) {
          throw new Error(`Variant for product ${item.productId} not found`);
        }

        const stockLevel = await tx.stockLevel.findUnique({
          where: {
            tenant_id_warehouse_id_variant_id: {
              tenant_id: session.tenantId,
              warehouse_id: warehouse.id,
              variant_id: variant.id,
            },
          },
        });

        if (!stockLevel || stockLevel.quantity_on_hand < item.quantity) {
          throw new Error(`Insufficient stock for product "${variant.product.name}"`);
        }

        // 1. Deduct Stock
        await tx.stockLevel.update({
          where: { id: stockLevel.id },
          data: { quantity_on_hand: stockLevel.quantity_on_hand - item.quantity },
        });

        // 2. Add SALE movement
        await tx.stockMovement.create({
          data: {
            tenant_id: session.tenantId,
            warehouse_id: warehouse.id,
            variant_id: variant.id,
            movement_type: 'sale',
            quantity: item.quantity,
            reference_type: 'POS_SALE',
            reference_id: saleReferenceId || undefined,
            moved_by: session.userId,
          },
        });
      }
    });

    await createAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'STOCK_DEDUCTED_SALE',
      entityType: 'PosTransaction',
      entityId: saleReferenceId || session.tenantId,
      afterJson: { items, saleReferenceId },
    });

    return NextResponse.json({ success: true, message: 'Stock deducted successfully' });
  } catch (error: any) {
    console.error('[Deduct Stock Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
