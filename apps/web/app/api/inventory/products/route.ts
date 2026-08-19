import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@repo/db';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    const products = await prisma.product.findMany({
      where: {
        tenant_id: session.tenantId,
        is_active: true,
        ...(category ? { category } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        variants: true,
      },
      orderBy: { name: 'asc' },
    });

    // Attach stock levels for each product
    const stockLevels = await prisma.stockLevel.findMany({
      where: { tenant_id: session.tenantId },
    });

    const enrichedProducts = products.map((prod) => {
      const variantIds = prod.variants.map((v) => v.id);
      const totalQty = stockLevels
        .filter((sl) => variantIds.includes(sl.variant_id))
        .reduce((sum, sl) => sum + sl.quantity_on_hand, 0);

      const defaultPriceNum = prod.default_price ? Number(prod.default_price) : 250;

      return {
        id: prod.id,
        sku: prod.sku,
        name: prod.name,
        category: prod.category || 'General',
        unit: prod.unit,
        hsnCode: prod.hsn_code,
        defaultPrice: defaultPriceNum,
        unitPrice: defaultPriceNum,
        totalQuantity: totalQty,
        variants: prod.variants.map((v) => ({
          ...v,
          sellingPrice: v.selling_price ? Number(v.selling_price) : defaultPriceNum,
          unitPrice: v.selling_price ? Number(v.selling_price) : defaultPriceNum,
        })),
      };
    });

    return NextResponse.json({ success: true, products: enrichedProducts });
  } catch (error: any) {
    console.error('[Inventory Products GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sku, name, category, unit, barcode, initialQuantity } = await req.json();

    if (!sku || !name || !unit) {
      return NextResponse.json({ error: 'SKU, Product Name and Unit are required' }, { status: 400 });
    }

    // Check SKU uniqueness for this tenant
    const existing = await prisma.product.findUnique({
      where: {
        tenant_id_sku: {
          tenant_id: session.tenantId,
          sku,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: `Product with SKU "${sku}" already exists` }, { status: 400 });
    }

    // Get default warehouse or create one
    let warehouse = await prisma.warehouse.findFirst({
      where: { tenant_id: session.tenantId },
    });

    if (!warehouse) {
      warehouse = await prisma.warehouse.create({
        data: {
          tenant_id: session.tenantId,
          name: 'Main Warehouse',
          type: 'distribution_center',
        },
      });
    }

    const qty = parseInt(initialQuantity || '0', 10);

    // Transactionally create Product, Variant, StockLevel and Movement
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          tenant_id: session.tenantId,
          sku,
          name,
          category: category || 'General',
          unit,
        },
      });

      const variant = await tx.productVariant.create({
        data: {
          tenant_id: session.tenantId,
          product_id: product.id,
          barcode: barcode || sku,
        },
      });

      const stockLevel = await tx.stockLevel.create({
        data: {
          tenant_id: session.tenantId,
          warehouse_id: warehouse.id,
          variant_id: variant.id,
          quantity_on_hand: qty,
        },
      });

      if (qty > 0) {
        await tx.stockMovement.create({
          data: {
            tenant_id: session.tenantId,
            warehouse_id: warehouse.id,
            variant_id: variant.id,
            movement_type: 'inbound',
            quantity: qty,
            reference_type: 'INITIAL_STOCK',
            moved_by: session.userId,
          },
        });
      }

      return { product, variant, stockLevel };
    });

    await createAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'PRODUCT_CREATED',
      entityType: 'Product',
      entityId: result.product.id,
      afterJson: { sku, name, initialQuantity: qty },
    });

    return NextResponse.json({ success: true, product: result.product });
  } catch (error: any) {
    console.error('[Inventory Product Create Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
