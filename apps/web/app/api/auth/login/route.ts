import { NextResponse } from 'next/server';
import { prisma } from '@repo/db';
import bcrypt from 'bcryptjs';
import { setAllAuthCookies } from '@/lib/auth-session';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find User in Database
    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail },
      include: { tenant: true },
    });

    if (!user || !user.password_hash) {
      return NextResponse.json(
        { error: 'Invalid email address or password' },
        { status: 401 }
      );
    }

    // 2. Compare Password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email address or password' },
        { status: 401 }
      );
    }

    // 3. Check if Tenant has completed Onboarding in DB
    const onboardingLog = await prisma.auditLog.findFirst({
      where: {
        tenant_id: user.tenant_id,
        action: 'ONBOARDING_COMPLETED',
      },
    });

    const isOnboarded = !!onboardingLog;

    // 4. Set All Docx 22 Compliant Auth Cookies with Onboarding Status
    await setAllAuthCookies({
      userId: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      isOnboarded,
    });

    // Update last_login_at
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        tenantId: user.tenant_id,
        tenantName: user.tenant?.business_name || 'Enterprise Workspace',
      },
    });
  } catch (error: any) {
    console.error('[Login API Error]:', error);
    return NextResponse.json(
      { error: 'Authentication failed', details: error.message },
      { status: 500 }
    );
  }
}
