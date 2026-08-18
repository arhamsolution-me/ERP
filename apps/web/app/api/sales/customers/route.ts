import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@repo/db';
import { createAuditLog } from '@/lib/audit';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customers = await prisma.customer.findMany({
      where: { tenant_id: session.tenantId },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, customers });
  } catch (error: any) {
    console.error('[Sales Customers GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, email, customerType, creditLimit } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        tenant_id: session.tenantId,
        name,
        phone: phone || null,
        email: email || null,
        customer_type: customerType || 'retail',
        credit_limit: creditLimit ? BigInt(creditLimit) : null,
      },
    });

    await createAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'CUSTOMER_CREATED',
      entityType: 'Customer',
      entityId: customer.id,
      afterJson: { name, email, phone },
    });

    return NextResponse.json({ success: true, customer });
  } catch (error: any) {
    console.error('[Sales Customer POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
