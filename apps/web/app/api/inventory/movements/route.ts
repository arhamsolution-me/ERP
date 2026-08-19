import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@repo/db';
import { isDevStoreFallbackAllowed } from '@/lib/dev-store-guard';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const movements = await prisma.stockMovement.findMany({
        where: { tenant_id: session.tenantId },
        orderBy: { created_at: 'desc' },
        take: 100,
      });

      // Enrich movement records with product & variant info
      const variantIds = Array.from(new Set(movements.map((m) => m.variant_id)));
      const variants = await prisma.productVariant.findMany({
        where: {
          id: { in: variantIds },
          tenant_id: session.tenantId,
        },
        include: {
          product: true,
        },
      });

      const variantMap = new Map(variants.map((v) => [v.id, v]));

      const enriched = movements.map((m) => {
        const v = variantMap.get(m.variant_id);
        return {
          id: m.id,
          date: m.created_at,
          productName: v?.product.name || 'Unknown Product',
          sku: v?.product.sku || 'N/A',
          movementType: m.movement_type,
          quantity: m.quantity,
          referenceType: m.reference_type || 'MANUAL',
        };
      });

      return NextResponse.json({ success: true, movements: enriched });
    } catch (dbErr: any) {
      if (!isDevStoreFallbackAllowed()) {
        console.error('[Inventory Movements GET] Database error, no fallback in this environment:', dbErr);
        return NextResponse.json(
          { error: 'A server error occurred. Please try again.' },
          { status: 500 }
        );
      }
      console.warn('[Inventory Movements GET] Database offline, returning empty movements list (non-production only):', dbErr.message);
      return NextResponse.json({ success: true, movements: [] });
    }
  } catch (error: any) {
    console.error('[Inventory Movements GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
