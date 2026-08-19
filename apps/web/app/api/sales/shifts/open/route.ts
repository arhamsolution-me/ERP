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

    const { openingCash, terminalCode } = await req.json();

    if (openingCash === undefined || openingCash === null || openingCash < 0) {
      return NextResponse.json({ error: 'Valid opening cash amount is required' }, { status: 400 });
    }

    // Resolve or find default terminal
    let terminal = await prisma.posTerminal.findFirst({
      where: {
        tenant_id: session.tenantId,
        ...(terminalCode ? { terminal_code: terminalCode } : {}),
      },
    });

    if (!terminal) {
      terminal = await prisma.posTerminal.create({
        data: {
          tenant_id: session.tenantId,
          branch_id: session.tenantId,
          terminal_code: terminalCode || 'POS-01',
        },
      });
    }

    // Check if an open shift already exists for this terminal
    const existingOpenShift = await prisma.shift.findFirst({
      where: {
        tenant_id: session.tenantId,
        terminal_id: terminal.id,
        status: 'open',
      },
    });

    if (existingOpenShift) {
      return NextResponse.json(
        {
          error: 'A shift is already open on this terminal. Please close the active shift first.',
          activeShift: {
            id: existingOpenShift.id,
            openedAt: existingOpenShift.opened_at,
            openingCash: existingOpenShift.opening_cash.toString(),
          },
        },
        { status: 400 }
      );
    }

    // Create new open shift
    const shift = await prisma.shift.create({
      data: {
        tenant_id: session.tenantId,
        terminal_id: terminal.id,
        cashier_id: session.userId,
        opening_cash: BigInt(Math.round(Number(openingCash))),
        status: 'open',
        opened_at: new Date(),
      },
    });

    await createAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'POS_SHIFT_OPENED',
      entityType: 'Shift',
      entityId: shift.id,
      afterJson: { openingCash: openingCash.toString(), terminalCode: terminal.terminal_code },
    });

    return NextResponse.json({
      success: true,
      message: 'Shift opened successfully',
      shift: {
        id: shift.id,
        terminalCode: terminal.terminal_code,
        openingCash: shift.opening_cash.toString(),
        openedAt: shift.opened_at,
        status: shift.status,
      },
    });
  } catch (error: any) {
    console.error('[Shift Open Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
