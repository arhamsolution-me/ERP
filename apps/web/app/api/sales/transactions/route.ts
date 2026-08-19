import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@repo/db';
import { devStore } from '@/lib/dev-store';
import { isDevStoreFallbackAllowed } from '@/lib/dev-store-guard';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const paymentMethod = searchParams.get('paymentMethod') || '';
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    try {
      // Build filter conditions
      const whereClause: any = {
        tenant_id: session.tenantId,
        ...(paymentMethod ? { payment_method: paymentMethod as any } : {}),
        ...(fromDate || toDate
          ? {
              created_at: {
                ...(fromDate ? { gte: new Date(fromDate) } : {}),
                ...(toDate ? { lte: new Date(new Date(toDate).setHours(23, 59, 59, 999)) } : {}),
              },
            }
          : {}),
      };

      if (search) {
        whereClause.OR = [
          { id: { contains: search, mode: 'insensitive' } },
          { customer_id: { contains: search, mode: 'insensitive' } },
        ];
      }

      const transactions = await prisma.posTransaction.findMany({
        where: whereClause,
        include: {
          items: {
            include: {
              variant: {
                include: { product: true },
              },
            },
          },
          refunds: {
            include: { items: true },
          },
        },
        orderBy: { created_at: 'desc' },
        take: 100,
      });

      // Enforce customer lookups for matched transactions
      const customerIds = transactions.map((t) => t.customer_id).filter(Boolean) as string[];
      const customers = await prisma.customer.findMany({
        where: {
          id: { in: customerIds },
          tenant_id: session.tenantId,
        },
      });

      const enriched = transactions.map((tx) => {
        const customer = customers.find((c) => c.id === tx.customer_id);
        const totalRefunded = tx.refunds.reduce((sum, r) => sum + r.amount, 0n);
        const isFullyRefunded = totalRefunded >= tx.total;
        const isPartiallyRefunded = totalRefunded > 0n && totalRefunded < tx.total;

        return {
          id: tx.id,
          receiptNumber: `INV-${tx.id.substring(0, 8).toUpperCase()}`,
          cashierId: tx.cashier_id,
          terminalId: tx.terminal_id,
          customer: customer ? { id: customer.id, name: customer.name, phone: customer.phone } : null,
          subtotal: tx.subtotal.toString(),
          tax: tx.tax_amount.toString(),
          discount: tx.discount_amount.toString(),
          total: tx.total.toString(),
          totalRefunded: totalRefunded.toString(),
          remainingRefundable: (tx.total - totalRefunded).toString(),
          paymentMethod: tx.payment_method,
          syncStatus: tx.sync_status,
          createdAt: tx.created_at,
          status: isFullyRefunded ? 'refunded' : isPartiallyRefunded ? 'partially_refunded' : 'completed',
          items: tx.items.map((it) => ({
            id: it.id,
            variantId: it.variant_id,
            productName: it.variant?.product?.name || 'Product Item',
            sku: it.variant?.product?.sku || 'SKU',
            size: it.variant?.size,
            color: it.variant?.color,
            quantity: it.quantity,
            unitPrice: it.unit_price.toString(),
            lineTotal: it.line_total.toString(),
          })),
          refundHistory: tx.refunds.map((r) => ({
            id: r.id,
            amount: r.amount.toString(),
            reason: r.reason,
            refundMethod: r.refund_method,
            createdAt: r.created_at,
          })),
        };
      });

      return NextResponse.json({ success: true, transactions: enriched });
    } catch (dbErr: any) {
      if (!isDevStoreFallbackAllowed()) {
        console.error('[Transactions GET] Database error, no fallback in this environment:', dbErr);
        return NextResponse.json(
          { error: 'A server error occurred. Please try again.' },
          { status: 500 }
        );
      }
      console.warn('[Transactions GET] Database offline, using devStore fallback (non-production only):', dbErr.message);
      const filtered = devStore.transactions.filter((tx) => {
        const matchSearch =
          !search ||
          tx.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
          tx.id.toLowerCase().includes(search.toLowerCase()) ||
          (tx.customer?.name && tx.customer.name.toLowerCase().includes(search.toLowerCase()));
        const matchMethod = !paymentMethod || tx.paymentMethod === paymentMethod;
        return matchSearch && matchMethod;
      });
      return NextResponse.json({ success: true, transactions: filtered });
    }
  } catch (error: any) {
    console.error('[Transactions GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
