import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@repo/db';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items } = await req.json(); // items: Array<{ productId: string, quantity: number }>

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 });
    }

    const productIds = items.map((i) => i.productId);
    const variants = await prisma.productVariant.findMany({
      where: {
        product_id: { in: productIds },
        tenant_id: session.tenantId,
      },
      include: { product: true },
    });

    const variantIds = variants.map((v) => v.id);
    const stockLevels = await prisma.stockLevel.findMany({
      where: {
        variant_id: { in: variantIds },
        tenant_id: session.tenantId,
      },
    });

    const validationErrors: string[] = [];

    for (const item of items) {
      const v = variants.find((variant) => variant.product_id === item.productId);
      if (!v) {
        validationErrors.push(`Product ID ${item.productId} not found`);
        continue;
      }
      const sl = stockLevels.find((s) => s.variant_id === v.id);
      const available = sl ? sl.quantity_on_hand : 0;
      if (available < item.quantity) {
        validationErrors.push(`Insufficient stock for "${v.product.name}" (Available: ${available}, Requested: ${item.quantity})`);
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({ valid: false, errors: validationErrors }, { status: 400 });
    }

    return NextResponse.json({ valid: true });
  } catch (error: any) {
    console.error('[Validate Stock Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
