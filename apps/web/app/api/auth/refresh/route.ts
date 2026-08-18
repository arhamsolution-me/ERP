import { NextResponse } from 'next/server';
import { getSession, setAllAuthCookies } from '@/lib/auth-session';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized / Expired Session' }, { status: 401 });
    }

    // Rotate and set new 15-min access token + 7-day refresh token
    await setAllAuthCookies({
      userId: session.userId,
      tenantId: session.tenantId,
      email: session.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
