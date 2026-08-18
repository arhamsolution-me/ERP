import { NextResponse } from 'next/server';
import { getSession, clearAllAuthCookies } from '@/lib/auth-session';
import { prisma } from '@repo/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { tenant: true },
    });

    if (!user || !user.tenant) {
      await clearAllAuthCookies();
      return NextResponse.json({ authenticated: false, user: null, error: 'User/Tenant not found in DB' }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        tenantId: user.tenant_id,
        tenantName: user.tenant?.business_name || '',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}
