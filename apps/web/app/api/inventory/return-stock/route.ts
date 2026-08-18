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

    const { items, returnReferenceId } = await req.json(); // items: Array<{ productId: string, quantity: number }>

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
        });

        if (!variant) continue;

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
            data: { quantity_on_hand: stockLevel.quantity_on_hand + item.quantity },
          });
        } else {
          await tx.stockLevel.create({
            data: {
              tenant_id: session.tenantId,
              warehouse_id: warehouse.id,
              variant_id: variant.id,
              quantity_on_hand: item.quantity,
            },
          });
        }

        // Add RETURN movement record
        await tx.stockMovement.create({
          data: {
            tenant_id: session.tenantId,
            warehouse_id: warehouse.id,
            variant_id: variant.id,
            movement_type: 'return',
            quantity: item.quantity,
            reference_type: 'SALES_RETURN',
            reference_id: returnReferenceId || undefined,
            moved_by: session.userId,
          },
        });
      }
    });

    await createAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'STOCK_RESTORED_RETURN',
      entityType: 'SalesReturn',
      entityId: returnReferenceId || session.tenantId,
      afterJson: { items, returnReferenceId },
    });

    return NextResponse.json({ success: true, message: 'Stock returned successfully' });
  } catch (error: any) {
    console.error('[Return Stock Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
