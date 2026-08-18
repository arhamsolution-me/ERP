import { NextResponse } from 'next/server';
import { prisma } from '@repo/db';
import bcrypt from 'bcryptjs';
import { setAllAuthCookies } from '@/lib/auth-session';

export async function POST(req: Request) {
  try {
    const { email, password, businessName } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please log in.' },
        { status: 400 }
      );
    }

    // 2. Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // 3. Create Tenant
    const tenant = await prisma.tenant.create({
      data: {
        business_name: businessName || 'My Enterprise Workspace',
        business_type: 'textile',
        status: 'active',
        country: 'Pakistan',
        default_currency: 'PKR',
        default_timezone: 'Asia/Karachi',
      },
    });

    // 4. Create User in Database
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password_hash,
        tenant_id: tenant.id,
        status: 'active',
      },
    });

    // 5. Set All Docx 22 Compliant Auth Cookies with isOnboarded: false
    await setAllAuthCookies({
      userId: user.id,
      tenantId: tenant.id,
      email: user.email,
      isOnboarded: false,
    });

    return NextResponse.json({
      success: true,
      message: 'Enterprise account created successfully',
      user: {
        id: user.id,
        email: user.email,
        tenantId: tenant.id,
        tenantName: tenant.business_name,
      },
    });
  } catch (error: any) {
    console.error('[Register API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed', stack: error.stack },
      { status: 500 }
    );
  }
}
