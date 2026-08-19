import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@repo/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
  } catch (error: any) {
    console.error('[Shift Current GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
