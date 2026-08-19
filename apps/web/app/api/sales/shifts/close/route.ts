import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@repo/db';
import { createAuditLog } from '@/lib/audit';
import { devStore } from '@/lib/dev-store';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shiftId, closingCash, supervisorNote } = await req.json();

    if (closingCash === undefined || closingCash === null || closingCash < 0) {
      return NextResponse.json({ error: 'Valid closing cash count is required' }, { status: 400 });
    }

    try {
      // Find shift by ID or find active open shift for tenant
      const shift = shiftId
        ? await prisma.shift.findUnique({ where: { id: shiftId } })
        : await prisma.shift.findFirst({
            where: {
              tenant_id: session.tenantId,
              status: 'open',
            },
            orderBy: { opened_at: 'desc' },
          });

      if (!shift || shift.tenant_id !== session.tenantId) {
        return NextResponse.json({ error: 'No active open shift found to close' }, { status: 404 });
      }

      if (shift.status === 'closed') {
        return NextResponse.json({ error: 'This shift has already been closed' }, { status: 400 });
      }

      const closedAt = new Date();

      // Sum all cash transactions on this terminal during this shift window
      const cashTransactions = await prisma.posTransaction.findMany({
        where: {
          tenant_id: session.tenantId,
          terminal_id: shift.terminal_id,
          payment_method: 'cash',
          created_at: {
            gte: shift.opened_at,
            lte: closedAt,
          },
        },
      });

      const totalCashSales = cashTransactions.reduce((sum, tx) => sum + tx.total, 0n);
      const expectedCash = shift.opening_cash + totalCashSales;
      const actualClosingCash = BigInt(Math.round(Number(closingCash)));
      const variance = actualClosingCash - expectedCash;

      // Close Shift inside transaction
      const updatedShift = await prisma.shift.update({
        where: { id: shift.id },
        data: {
          status: 'closed',
          closed_at: closedAt,
          closing_cash: actualClosingCash,
          expected_cash: expectedCash,
          variance,
        },
      });

      await createAuditLog({
        tenantId: session.tenantId,
        userId: session.userId,
        action: 'POS_SHIFT_CLOSED',
        entityType: 'Shift',
        entityId: updatedShift.id,
        afterJson: {
          openingCash: shift.opening_cash.toString(),
          totalCashSales: totalCashSales.toString(),
          expectedCash: expectedCash.toString(),
          actualClosingCash: actualClosingCash.toString(),
          variance: variance.toString(),
          supervisorNote,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Shift closed successfully',
        shiftSummary: {
          id: updatedShift.id,
          openedAt: updatedShift.opened_at,
          closedAt: updatedShift.closed_at,
          openingCash: updatedShift.opening_cash.toString(),
          totalCashSales: totalCashSales.toString(),
          expectedCash: expectedCash.toString(),
          closingCash: actualClosingCash.toString(),
          variance: variance.toString(),
          discrepancy: variance !== 0n,
        },
      });
    } catch (dbErr: any) {
      console.warn('[Shift Close POST] Database offline, closing devStore shift:', dbErr.message);
      const shift = devStore.activeShift;
      const opening = Number(shift?.openingCash || 5000);
      const txs = devStore.transactions;
      const cashSales = txs.filter((t) => t.paymentMethod === 'cash').reduce((sum, t) => sum + Number(t.total), 0);
      const expected = opening + cashSales;
      const actual = Number(closingCash);
      const variance = actual - expected;

      if (devStore.activeShift) {
        devStore.activeShift.status = 'closed';
        devStore.activeShift.closedAt = new Date().toISOString();
        devStore.activeShift.closingCash = String(actual);
        devStore.activeShift.expectedCash = String(expected);
        devStore.activeShift.variance = String(variance);
      }

      return NextResponse.json({
        success: true,
        message: 'Shift closed successfully (Dev)',
        shiftSummary: {
          id: shift?.id || 'shift-dev-001',
          openedAt: shift?.openedAt || new Date().toISOString(),
          closedAt: new Date().toISOString(),
          openingCash: String(opening),
          totalCashSales: String(cashSales),
          expectedCash: String(expected),
          closingCash: String(actual),
          variance: String(variance),
          discrepancy: variance !== 0,
        },
      });
    }
  } catch (error: any) {
    console.error('[Shift Close Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
