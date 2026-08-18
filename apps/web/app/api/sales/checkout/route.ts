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

    const { items, paymentMethod, customerId, discountAmount } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Checkout requires at least one item' }, { status: 400 });
    }

    // Get default branch and terminal for this tenant
    let terminal = await prisma.posTerminal.findFirst({
      where: { tenant_id: session.tenantId },
    });

    if (!terminal) {
      terminal = await prisma.posTerminal.create({
        data: {
          tenant_id: session.tenantId,
          branch_id: session.tenantId,
          terminal_code: 'POS-01',
        },
      });
    }

    // Compute totals server-side
    let subtotal = 0n;
    const itemRecords: Array<{ variant_id: string; quantity: number; unit_price: bigint; line_total: bigint }> = [];

    const productIds = items.map((i: any) => i.productId);
    const variants = await prisma.productVariant.findMany({
      where: {
        product_id: { in: productIds },
        tenant_id: session.tenantId,
      },
      include: { product: true },
    });

    for (const item of items) {
      const v = variants.find((variant) => variant.product_id === item.productId);
      if (!v) {
        return NextResponse.json({ error: `Product variant not found for ID ${item.productId}` }, { status: 400 });
      }
      const unitPrice = BigInt(item.unitPrice || 100);
      const lineTotal = unitPrice * BigInt(item.quantity);
      subtotal += lineTotal;

      itemRecords.push({
        variant_id: v.id,
        quantity: item.quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
      });
    }

    const discount = BigInt(discountAmount || 0);
    const tax = (subtotal * 17n) / 100n; // 17% standard tax
    const total = subtotal + tax - discount;
    const idempotencyKey = `POS-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Create POS Transaction inside Prisma Transaction
    const transaction = await prisma.$transaction(async (tx) => {
      const posTx = await tx.posTransaction.create({
        data: {
          tenant_id: session.tenantId,
          branch_id: terminal.branch_id,
          terminal_id: terminal.id,
          cashier_id: session.userId,
          customer_id: customerId || undefined,
          idempotency_key: idempotencyKey,
          subtotal,
          tax_amount: tax,
          discount_amount: discount,
          total,
          payment_method: paymentMethod || 'cash',
          sync_status: 'synced',
        },
      });

      for (const item of itemRecords) {
        await tx.posTransactionItem.create({
          data: {
            tenant_id: session.tenantId,
            transaction_id: posTx.id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            line_total: item.line_total,
          },
        });
      }

      return posTx;
    });

    // 2. Invoke Internal Stock Deduction API (Cross-Module Contract)
    try {
      const warehouse = await prisma.warehouse.findFirst({ where: { tenant_id: session.tenantId } });
      if (warehouse) {
        for (const item of items) {
          const v = variants.find((variant) => variant.product_id === item.productId);
          if (v) {
            const sl = await prisma.stockLevel.findUnique({
              where: {
                tenant_id_warehouse_id_variant_id: {
                  tenant_id: session.tenantId,
                  warehouse_id: warehouse.id,
                  variant_id: v.id,
                },
              },
            });
            if (sl && sl.quantity_on_hand >= item.quantity) {
              await prisma.stockLevel.update({
                where: { id: sl.id },
                data: { quantity_on_hand: sl.quantity_on_hand - item.quantity },
              });

              await prisma.stockMovement.create({
                data: {
                  tenant_id: session.tenantId,
                  warehouse_id: warehouse.id,
                  variant_id: v.id,
                  movement_type: 'sale',
                  quantity: item.quantity,
                  reference_type: 'POS_SALE',
                  reference_id: transaction.id,
                  moved_by: session.userId,
                },
              });
            }
          }
        }
      }
    } catch (e) {
      console.error('[Cross-Module Stock Deduct Warning]:', e);
    }

    await createAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'POS_CHECKOUT_COMPLETED',
      entityType: 'PosTransaction',
      entityId: transaction.id,
      afterJson: { total: total.toString(), paymentMethod },
    });

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      invoiceNumber: `INV-${transaction.id.substring(0, 8).toUpperCase()}`,
      subtotal: subtotal.toString(),
      tax: tax.toString(),
      total: total.toString(),
    });
  } catch (error: any) {
    console.error('[Sales Checkout POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
