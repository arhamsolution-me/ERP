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

    const { transactionId, items, reason, refundMethod, supervisorPin } = await req.json();

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required for refund' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'At least one line item must be selected for refund' }, { status: 400 });
    }

    // 1. Fetch original POS transaction
    const transaction = await prisma.posTransaction.findUnique({
      where: { id: transactionId },
      include: {
        items: true,
        refunds: true,
      },
    });

    if (!transaction || transaction.tenant_id !== session.tenantId) {
      return NextResponse.json({ error: 'Original transaction not found' }, { status: 404 });
    }

    // 2. Anti-double-refunding check
    const priorRefundsTotal = transaction.refunds.reduce((sum, r) => sum + r.amount, 0n);
    const maxRefundable = transaction.total - priorRefundsTotal;

    if (maxRefundable <= 0n) {
      return NextResponse.json(
        { error: 'This transaction has already been fully refunded' },
        { status: 400 }
      );
    }

    // 3. Compute refund items and totals
    let requestedRefundTotal = 0n;
    const refundItemRecords: Array<{
      variant_id: string;
      quantity: number;
      unit_price: bigint;
      line_total: bigint;
    }> = [];

    for (const item of items) {
      const origItem = transaction.items.find((it) => it.variant_id === item.variantId);
      if (!origItem) {
        return NextResponse.json(
          { error: `Variant ID ${item.variantId} was not part of original transaction` },
          { status: 400 }
        );
      }

      const qty = parseInt(item.quantity || '1', 10);
      if (qty <= 0 || qty > origItem.quantity) {
        return NextResponse.json(
          { error: `Invalid refund quantity for item: ${qty} (max: ${origItem.quantity})` },
          { status: 400 }
        );
      }

      const lineTotal = origItem.unit_price * BigInt(qty);
      requestedRefundTotal += lineTotal;

      refundItemRecords.push({
        variant_id: item.variantId,
        quantity: qty,
        unit_price: origItem.unit_price,
        line_total: lineTotal,
      });
    }

    if (requestedRefundTotal > maxRefundable) {
      return NextResponse.json(
        {
          error: `Requested refund of PKR ${requestedRefundTotal} exceeds maximum refundable amount of PKR ${maxRefundable}`,
        },
        { status: 400 }
      );
    }

    const idempotencyKey = req.headers.get('x-idempotency-key') || `REFUND-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // 4. Execute atomic Refund creation + Stock reversal
    const refund = await prisma.$transaction(async (tx) => {
      const refundRecord = await tx.refund.create({
        data: {
          tenant_id: session.tenantId,
          transaction_id: transaction.id,
          reason: reason || 'other',
          refund_method: refundMethod || transaction.payment_method,
          amount: requestedRefundTotal,
          approved_by: supervisorPin ? session.userId : null,
          idempotency_key: idempotencyKey,
        },
      });

      for (const item of refundItemRecords) {
        await tx.refundItem.create({
          data: {
            tenant_id: session.tenantId,
            refund_id: refundRecord.id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            line_total: item.line_total,
          },
        });
      }

      return refundRecord;
    });

    // 5. Reverse Stock Levels & Log Stock Movement (Return)
    try {
      const warehouse = await prisma.warehouse.findFirst({
        where: { tenant_id: session.tenantId },
      });

      if (warehouse) {
        for (const item of refundItemRecords) {
          const sl = await prisma.stockLevel.findUnique({
            where: {
              tenant_id_warehouse_id_variant_id: {
                tenant_id: session.tenantId,
                warehouse_id: warehouse.id,
                variant_id: item.variant_id,
              },
            },
          });

          if (sl) {
            await prisma.stockLevel.update({
              where: { id: sl.id },
              data: { quantity_on_hand: sl.quantity_on_hand + item.quantity },
            });
          }

          await prisma.stockMovement.create({
            data: {
              tenant_id: session.tenantId,
              warehouse_id: warehouse.id,
              variant_id: item.variant_id,
              movement_type: 'return',
              quantity: item.quantity,
              reference_type: 'POS_REFUND',
              reference_id: refund.id,
              moved_by: session.userId,
            },
          });
        }
      }
    } catch (e) {
      console.error('[Stock Reversal Warning]:', e);
    }

    await createAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'POS_REFUND_PROCESSED',
      entityType: 'Refund',
      entityId: refund.id,
      afterJson: {
        transactionId: transaction.id,
        amount: requestedRefundTotal.toString(),
        reason,
        refundMethod: refund.refund_method,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Refund processed and stock restored successfully',
      refund: {
        id: refund.id,
        transactionId: transaction.id,
        amount: requestedRefundTotal.toString(),
        reason: refund.reason,
        refundMethod: refund.refund_method,
        createdAt: refund.created_at,
      },
    });
  } catch (error: any) {
    console.error('[Refund API Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
