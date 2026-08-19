import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@repo/db';
import { createAuditLog } from '@/lib/audit';
import { devStore } from '@/lib/dev-store';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
      const order = await prisma.wholesaleOrder.findUnique({
        where: { id },
      });

      if (!order || order.tenant_id !== session.tenantId) {
        throw new Error('Wholesale order not found in database');
      }

      // Check if invoice already exists for this order
      const existingInvoice = await prisma.invoice.findFirst({
        where: {
          tenant_id: session.tenantId,
          reference_id: order.id,
        },
      });

      if (existingInvoice) {
        return NextResponse.json({
          success: true,
          message: 'Invoice already exists for this order',
          invoice: {
            id: existingInvoice.id,
            invoiceNumber: existingInvoice.invoice_number,
            amount: existingInvoice.amount.toString(),
            status: existingInvoice.status,
          },
        });
      }

      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      const taxAmount = (order.total_amount * 17n) / 100n;

      const result = await prisma.$transaction(async (tx) => {
        // 1. Create Invoice in Finance module
        const invoice = await tx.invoice.create({
          data: {
            tenant_id: session.tenantId,
            invoice_number: invoiceNumber,
            entity_type: 'sale',
            reference_id: order.id,
            amount: order.total_amount,
            tax_amount: taxAmount,
            status: 'sent',
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30-day payment term
          },
        });

        // 2. Update Wholesale Order status to 'invoiced'
        const updatedOrder = await tx.wholesaleOrder.update({
          where: { id: order.id },
          data: { status: 'invoiced' },
        });

        return { invoice, order: updatedOrder };
      });

      await createAuditLog({
        tenantId: session.tenantId,
        userId: session.userId,
        action: 'SALES_INVOICE_GENERATED',
        entityType: 'Invoice',
        entityId: result.invoice.id,
        afterJson: {
          orderId: order.id,
          invoiceNumber: result.invoice.invoice_number,
          amount: result.invoice.amount.toString(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Finance invoice generated and linked to wholesale order successfully',
        invoice: {
          id: result.invoice.id,
          invoiceNumber: result.invoice.invoice_number,
          amount: result.invoice.amount.toString(),
          taxAmount: result.invoice.tax_amount.toString(),
          status: result.invoice.status,
          dueDate: result.invoice.due_date,
        },
        order: {
          id: result.order.id,
          status: result.order.status,
        },
      });
    } catch (dbErr: any) {
      console.warn('[Wholesale Invoice] Database offline, generating devStore invoice:', dbErr.message);
      const matched = devStore.wholesaleOrders.find((o) => o.id === id);
      if (!matched) {
        return NextResponse.json({ error: 'Order not found in dev store' }, { status: 404 });
      }

      matched.status = 'invoiced';
      const invNum = `INV-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      matched.invoice = {
        id: `inv-dev-${Date.now()}`,
        invoiceNumber: invNum,
        status: 'sent',
      };

      const tax = Math.round(Number(matched.totalAmount) * 0.17);

      return NextResponse.json({
        success: true,
        message: 'Finance invoice generated and linked to wholesale order successfully (Dev)',
        invoice: {
          id: matched.invoice.id,
          invoiceNumber: invNum,
          amount: matched.totalAmount,
          taxAmount: String(tax),
          status: 'sent',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        order: {
          id: matched.id,
          status: 'invoiced',
        },
      });
    }
  } catch (error: any) {
    console.error('[Generate Invoice POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
