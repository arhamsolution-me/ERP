import { NextResponse } from 'next/server';
import { getSession, setAllAuthCookies, clearAllAuthCookies } from '@/lib/auth-session';
import { prisma } from '@repo/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
    });

    if (!user || !tenant) {
      await clearAllAuthCookies();
      return NextResponse.json({ error: 'User/Tenant not found in DB' }, { status: 401 });
    }

    const onboardingLog = await prisma.auditLog.findFirst({
      where: {
        tenant_id: session.tenantId,
        action: 'ONBOARDING_COMPLETED',
      },
      orderBy: { created_at: 'desc' },
    });

    const auditData = (onboardingLog?.after_json as any) || {};

    return NextResponse.json({
      success: true,
      businessName: tenant?.business_name || 'My Enterprise Workspace',
      country: tenant?.country === 'Pakistani' ? 'Pakistan' : (tenant?.country || 'Pakistan'),
      currency: tenant?.default_currency || 'PKR',
      timezone: tenant?.default_timezone || 'Asia/Karachi',
      activeModules: auditData.activeModules || ['sales-management', 'inventory-management'],
      orgSize: auditData.orgSize || 'team',
      teamCountRange: auditData.teamCountRange || '1-5',
      branchCount: auditData.branchCount || 1,
    });
  } catch (error: any) {
    console.error('[Onboarding GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      businessName,
      businessType,
      country,
      currency,
      timezone,
      orgSize,
      teamCountRange,
      branchCount,
      activeModules,
      teamInvites,
    } = await req.json();

    // 1. Update Tenant Info in Prisma DB
    await prisma.tenant.update({
      where: { id: session.tenantId },
      data: {
        business_name: businessName || 'My Enterprise Workspace',
        business_type: businessType || 'textile',
        country: country === 'Pakistani' ? 'Pakistan' : (country || 'Pakistan'),
        default_currency: currency || 'PKR',
        default_timezone: timezone || 'Asia/Karachi',
      },
    });

    // 2. Audit log entry for Onboarding Completion (Docx 23 §3)
    await prisma.auditLog.create({
      data: {
        tenant_id: session.tenantId,
        user_id: session.userId,
        action: 'ONBOARDING_COMPLETED',
        entity_type: 'Tenant',
        entity_id: session.tenantId,
        after_json: {
          orgSize,
          teamCountRange,
          branchCount,
          activeModules,
          teamInvitesCount: teamInvites?.length || 0,
          completedAt: new Date().toISOString(),
        },
      },
    });

    // 3. Re-set Auth Cookies with isOnboarded: true and activeModules
    await setAllAuthCookies({
      userId: session.userId,
      tenantId: session.tenantId,
      email: session.email,
      isOnboarded: true,
      activeModules: activeModules || [],
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
    });
  } catch (error: any) {
    console.error('[Onboarding API Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
