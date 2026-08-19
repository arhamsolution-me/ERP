import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@repo/db';
import { devStore } from '@/lib/dev-store';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const activeShift = await prisma.shift.findFirst({
        where: {
          tenant_id: session.tenantId,
          status: 'open',
        },
        include: {
          terminal: true,
        },
        orderBy: { opened_at: 'desc' },
      });

      if (!activeShift) {
        return NextResponse.json({
          success: true,
          hasActiveShift: false,
          activeShift: null,
        });
      }

      // Get all transactions during this shift
      const transactions = await prisma.posTransaction.findMany({
        where: {
          tenant_id: session.tenantId,
          terminal_id: activeShift.terminal_id,
          created_at: { gte: activeShift.opened_at },
        },
      });

      const totalSales = transactions.reduce((sum, tx) => sum + tx.total, 0n);
      const cashSales = transactions
        .filter((tx) => tx.payment_method === 'cash')
        .reduce((sum, tx) => sum + tx.total, 0n);
      const cardSales = transactions
        .filter((tx) => tx.payment_method === 'card')
        .reduce((sum, tx) => sum + tx.total, 0n);
      const digitalSales = transactions
        .filter((tx) => tx.payment_method === 'jazzcash' || tx.payment_method === 'easypaisa')
        .reduce((sum, tx) => sum + tx.total, 0n);

      return NextResponse.json({
        success: true,
        hasActiveShift: true,
        activeShift: {
          id: activeShift.id,
          terminalCode: activeShift.terminal?.terminal_code || 'POS-01',
          cashierId: activeShift.cashier_id,
          openingCash: activeShift.opening_cash.toString(),
          openedAt: activeShift.opened_at,
          runningMetrics: {
            transactionCount: transactions.length,
            totalSales: totalSales.toString(),
            cashSales: cashSales.toString(),
            cardSales: cardSales.toString(),
            digitalSales: digitalSales.toString(),
            currentExpectedCash: (activeShift.opening_cash + cashSales).toString(),
          },
        },
      });
    } catch (dbErr: any) {
      console.warn('[Shift Current GET] Database offline, serving devStore shift:', dbErr.message);
      const shift = devStore.activeShift;
      if (!shift || shift.status !== 'open') {
        return NextResponse.json({ success: true, hasActiveShift: false, activeShift: null });
      }

      const txs = devStore.transactions;
      const totalSales = txs.reduce((sum, t) => sum + Number(t.total), 0);
      const cashSales = txs.filter((t) => t.paymentMethod === 'cash').reduce((sum, t) => sum + Number(t.total), 0);

      return NextResponse.json({
        success: true,
        hasActiveShift: true,
        activeShift: {
          id: shift.id,
          terminalCode: shift.terminalCode,
          cashierId: shift.cashierId,
          openingCash: shift.openingCash,
          openedAt: shift.openedAt,
          runningMetrics: {
            transactionCount: txs.length,
            totalSales: String(totalSales),
            cashSales: String(cashSales),
            cardSales: '0',
            digitalSales: '0',
            currentExpectedCash: String(Number(shift.openingCash) + cashSales),
          },
        },
      });
    }
  } catch (error: any) {
    console.error('[Shift Current GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
