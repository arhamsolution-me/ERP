import {
  Controller, Get, Post, Param, Body,
  Req, UseGuards, Headers
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import type { AuthenticatedRequest } from '../../common/types/request.types';
import { prisma } from '@repo/db';

@ApiTags('Finance')
@ApiBearerAuth('ClerkAuth')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Controller('finance')
export class FinanceController {

  // ─── Invoices ─────────────────────────────────────────────────────────────

  @Get('invoices')
  @Permissions('finance.invoice.read')
  @ApiOperation({ summary: 'List all invoices' })
  async getInvoices(@Req() req: AuthenticatedRequest) {
    return prisma.invoice.findMany({
      where: { tenant_id: req.tenantId! },
      orderBy: { due_date: 'asc' },
    });
  }

  @Post('invoices')
  @Permissions('finance.invoice.create')
  @ApiOperation({ summary: 'Create an invoice (idempotent)' })
  async createInvoice(
    @Body() body: { invoice_number: string; entity_type: string; reference_id?: string; amount: number; tax_amount: number; due_date?: string },
    @Req() req: AuthenticatedRequest,
  ) {
    const existing = await prisma.invoice.findUnique({
      where: { invoice_number: body.invoice_number },
    });
    if (existing) return existing;

    return prisma.invoice.create({
      data: {
        tenant_id: req.tenantId!,
        invoice_number: body.invoice_number,
        entity_type: body.entity_type as any,
        reference_id: body.reference_id,
        amount: BigInt(body.amount),
        tax_amount: BigInt(body.tax_amount),
        status: 'draft',
        due_date: body.due_date ? new Date(body.due_date) : undefined,
      },
    });
  }

  // ─── Payments ─────────────────────────────────────────────────────────────

  @Post('payments')
  @Permissions('finance.payment.record')
  @ApiOperation({ summary: 'Record a payment (idempotent)' })
  async recordPayment(
    @Body() body: { invoice_id?: string; amount: number; method: string; transaction_ref?: string; idempotency_key?: string },
    @Req() req: AuthenticatedRequest,
    @Headers('idempotency-key') headerKey?: string,
  ) {
    const key = headerKey || body.idempotency_key;
    if (key) {
      const existing = await prisma.payment.findUnique({
        where: { idempotency_key: key },
      });
      if (existing) return existing;
    }

    return prisma.payment.create({
      data: {
        tenant_id: req.tenantId!,
        invoice_id: body.invoice_id,
        amount: BigInt(body.amount),
        method: body.method,
        transaction_ref: body.transaction_ref,
        idempotency_key: key,
        paid_at: new Date(),
      },
    });
  }

  // ─── Bank Reconciliation ──────────────────────────────────────────────────

  @Get('reconciliation')
  @Permissions('finance.reconcile.read')
  @ApiOperation({ summary: 'List bank reconciliation records' })
  async getReconciliation(@Req() req: AuthenticatedRequest) {
    return prisma.bankReconciliation.findMany({ where: { tenant_id: req.tenantId! } });
  }

  @Post('reconciliation/match')
  @Permissions('finance.reconcile.approve')
  @ApiOperation({ summary: 'Match a bank statement line to a payment' })
  async matchReconciliation(
    @Body() body: { bank_account_id: string; statement_line_ref: string; matched_payment_id?: string },
    @Req() req: AuthenticatedRequest,
  ) {
    return prisma.bankReconciliation.create({
      data: {
        tenant_id: req.tenantId!,
        bank_account_id: body.bank_account_id,
        statement_line_ref: body.statement_line_ref,
        matched_payment_id: body.matched_payment_id,
        status: body.matched_payment_id ? 'matched' : 'unmatched',
      },
    });
  }

  // ─── Export Documents ─────────────────────────────────────────────────────

  @Post('export-documents')
  @Permissions('finance.export_doc.create')
  @ApiOperation({ summary: 'Create an export document (LC, invoice, packing list)' })
  async createExportDoc(
    @Body() body: { batch_id?: string; document_type: string; document_number: string; file_url?: string },
    @Req() req: AuthenticatedRequest,
  ) {
    return prisma.exportDocument.create({
      data: {
        tenant_id: req.tenantId!,
        batch_id: body.batch_id,
        document_type: body.document_type as any,
        document_number: body.document_number,
        file_url: body.file_url,
        status: 'pending',
      },
    });
  }

  // ─── Reports ──────────────────────────────────────────────────────────────

  @Get('reports/pnl')
  @Permissions('finance.report.read')
  @ApiOperation({ summary: 'Profit & Loss summary report' })
  async getPnl(@Req() req: AuthenticatedRequest) {
    const [invoices, payments] = await Promise.all([
      prisma.invoice.aggregate({
        where: { tenant_id: req.tenantId!, status: 'paid' },
        _sum: { amount: true, tax_amount: true },
      }),
      prisma.payment.aggregate({
        where: { tenant_id: req.tenantId! },
        _sum: { amount: true },
      }),
    ]);
    return {
      total_invoiced: invoices._sum.amount?.toString() ?? '0',
      total_tax: invoices._sum.tax_amount?.toString() ?? '0',
      total_received: payments._sum.amount?.toString() ?? '0',
    };
  }
}
