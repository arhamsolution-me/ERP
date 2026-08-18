import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@repo/db';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
  } catch (error: any) {
    console.error('[Inventory Movements GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
