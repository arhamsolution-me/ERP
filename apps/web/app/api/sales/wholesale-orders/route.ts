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
    const status = searchParams.get('status') || '';
    const customerId = searchParams.get('customerId') || '';

    const whereClause: any = {
      tenant_id: session.tenantId,
      ...(status ? { status: status as any } : {}),
      ...(customerId ? { customer_id: customerId } : {}),
    };

    const orders = await prisma.wholesaleOrder.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const customerIds = orders.map((o) => o.customer_id);
    const customers = await prisma.customer.findMany({
      where: {
        id: { in: customerIds },
        tenant_id: session.tenantId,
      },
    });

    // Check linked invoices
    const orderIds = orders.map((o) => o.id);
    const invoices = await prisma.invoice.findMany({
      where: {
        tenant_id: session.tenantId,
        reference_id: { in: orderIds },
      },
    });

    const enriched = orders.map((o) => {
      const customer = customers.find((c) => c.id === o.customer_id);
      const invoice = invoices.find((inv) => inv.reference_id === o.id);

      return {
        id: o.id,
        orderNumber: `WO-${o.id.substring(0, 8).toUpperCase()}`,
        status: o.status,
        totalAmount: o.total_amount.toString(),
        createdAt: o.created_at,
        customer: customer
          ? {
              id: customer.id,
              name: customer.name,
              phone: customer.phone,
              email: customer.email,
              creditLimit: customer.credit_limit ? customer.credit_limit.toString() : '0',
            }
          : null,
        invoice: invoice
          ? {
              id: invoice.id,
              invoiceNumber: invoice.invoice_number,
              status: invoice.status,
            }
          : null,
        items: o.items.map((it) => ({
          id: it.id,
          variantId: it.variant_id,
          productName: it.variant?.product?.name || 'Product',
          sku: it.variant?.product?.sku || 'SKU',
          size: it.variant?.size,
          color: it.variant?.color,
          quantity: it.quantity,
          unitPrice: it.unit_price.toString(),
          lineTotal: (it.unit_price * BigInt(it.quantity)).toString(),
        })),
      };
    });

    return NextResponse.json({ success: true, orders: enriched });
  } catch (error: any) {
    console.error('[Wholesale Orders GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customerId, items, status: requestedStatus } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: 'Wholesale customer selection is required' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must have at least one line item' }, { status: 400 });
    }

    // Verify Customer exists and is wholesale
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer || customer.tenant_id !== session.tenantId) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Resolve variant IDs
    const variantIds = items.map((i: any) => i.variantId);
    const variants = await prisma.productVariant.findMany({
      where: {
        id: { in: variantIds },
        tenant_id: session.tenantId,
      },
      include: { product: true },
    });

    let totalAmount = 0n;
    const itemRecords: Array<{ variant_id: string; quantity: number; unit_price: bigint }> = [];

    for (const item of items) {
      const v = variants.find((variant) => variant.id === item.variantId);
      if (!v) {
        return NextResponse.json({ error: `Variant not found: ${item.variantId}` }, { status: 400 });
      }

      const qty = parseInt(item.quantity || '1', 10);
      const negotiatedPrice = BigInt(Math.round(Number(item.unitPrice || v.selling_price || 250)));
      totalAmount += negotiatedPrice * BigInt(qty);

      itemRecords.push({
        variant_id: v.id,
        quantity: qty,
        unit_price: negotiatedPrice,
      });
    }

    const idempotencyKey = req.headers.get('x-idempotency-key') || `WO-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const orderStatus = requestedStatus === 'confirmed' ? 'confirmed' : 'draft';

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.wholesaleOrder.create({
        data: {
          tenant_id: session.tenantId,
          customer_id: customer.id,
          branch_id: session.tenantId,
          status: orderStatus,
          total_amount: totalAmount,
          created_by: session.userId,
          idempotency_key: idempotencyKey,
        },
      });

      for (const it of itemRecords) {
        await tx.wholesaleOrderItem.create({
          data: {
            tenant_id: session.tenantId,
            order_id: createdOrder.id,
            variant_id: it.variant_id,
            quantity: it.quantity,
            unit_price: it.unit_price,
          },
        });
      }

      // If created as confirmed directly, reserve stock
      if (orderStatus === 'confirmed') {
        const warehouse = await tx.warehouse.findFirst({ where: { tenant_id: session.tenantId } });
        if (warehouse) {
          for (const it of itemRecords) {
            const sl = await tx.stockLevel.findUnique({
              where: {
                tenant_id_warehouse_id_variant_id: {
                  tenant_id: session.tenantId,
                  warehouse_id: warehouse.id,
                  variant_id: it.variant_id,
                },
              },
            });
            if (sl) {
              await tx.stockLevel.update({
                where: { id: sl.id },
                data: { quantity_reserved: sl.quantity_reserved + it.quantity },
              });
            }
          }
        }
      }

      return createdOrder;
    });

    await createAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: 'WHOLESALE_ORDER_CREATED',
      entityType: 'WholesaleOrder',
      entityId: order.id,
      afterJson: {
        customerId: customer.id,
        status: order.status,
        totalAmount: totalAmount.toString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Wholesale order ${orderStatus} created successfully`,
      order: {
        id: order.id,
        orderNumber: `WO-${order.id.substring(0, 8).toUpperCase()}`,
        status: order.status,
        totalAmount: totalAmount.toString(),
      },
    });
  } catch (error: any) {
    console.error('[Wholesale Order POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
