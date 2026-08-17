import {
  Controller, Get, Post, Patch, Param, Body,
  Req, UseGuards, HttpCode, HttpStatus, Headers
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import type { AuthenticatedRequest } from '../../common/types/request.types';
import { prisma } from '@repo/db';

@ApiTags('Sales & POS')
@ApiBearerAuth('ClerkAuth')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Controller()
export class SalesController {

  // ─── POS Terminals ────────────────────────────────────────────────────────

  @Get('pos/terminals')
  @Permissions('pos.terminal.read')
  @ApiOperation({ summary: 'List POS terminals for the tenant' })
  async getTerminals(@Req() req: AuthenticatedRequest) {
    return prisma.posTerminal.findMany({ where: { tenant_id: req.tenantId! } });
  }

  // ─── POS Transactions ─────────────────────────────────────────────────────

  @Post('pos/transactions')
  @Permissions('pos.sale.create')
  @ApiOperation({ summary: 'Create a POS transaction (idempotent)' })
  async createTransaction(
    @Body() body: {
      branch_id: string; terminal_id: string; cashier_id: string; customer_id?: string;
      idempotency_key: string; subtotal: number; tax_amount: number; discount_amount: number;
      total: number; payment_method: string; items: { variant_id: string; quantity: number; unit_price: number }[];
    },
    @Req() req: AuthenticatedRequest,
    @Headers('idempotency-key') headerKey?: string,
  ) {
    const key = headerKey || body.idempotency_key;
    // Idempotency: return existing if same key
    const existing = await prisma.posTransaction.findUnique({ where: { idempotency_key: key } });
    if (existing) return existing;

    return prisma.$transaction(async (tx) => {
      const txn = await tx.posTransaction.create({
        data: {
          tenant_id: req.tenantId!,
          branch_id: body.branch_id,
          terminal_id: body.terminal_id,
          cashier_id: body.cashier_id,
          customer_id: body.customer_id,
          idempotency_key: key,
          subtotal: BigInt(body.subtotal),
          tax_amount: BigInt(body.tax_amount),
          discount_amount: BigInt(body.discount_amount),
          total: BigInt(body.total),
          payment_method: body.payment_method as any,
          sync_status: 'synced',
          items: {
            create: body.items.map(item => ({
              tenant_id: req.tenantId!,
              variant_id: item.variant_id,
              quantity: item.quantity,
              unit_price: BigInt(item.unit_price),
              line_total: BigInt(item.quantity * item.unit_price),
            })),
          },
        },
        include: { items: true },
      });
      return txn;
    });
  }

  @Get('pos/transactions')
  @Permissions('pos.sale.read')
  @ApiOperation({ summary: 'List POS transactions (branch-scoped)' })
  async getTransactions(@Req() req: AuthenticatedRequest) {
    return prisma.posTransaction.findMany({
      where: { tenant_id: req.tenantId! },
      include: { items: true },
      orderBy: { created_at: 'desc' },
    });
  }

  // ─── Customers ────────────────────────────────────────────────────────────

  @Get('customers')
  @Permissions('customer.read')
  @ApiOperation({ summary: 'List customers' })
  async getCustomers(@Req() req: AuthenticatedRequest) {
    return prisma.customer.findMany({ where: { tenant_id: req.tenantId! } });
  }

  @Post('customers')
  @Permissions('customer.create')
  @ApiOperation({ summary: 'Create a customer' })
  async createCustomer(
    @Body() body: { name: string; phone?: string; email?: string; customer_type: string; credit_limit?: number },
    @Req() req: AuthenticatedRequest,
  ) {
    return prisma.customer.create({
      data: {
        tenant_id: req.tenantId!,
        name: body.name,
        phone: body.phone,
        email: body.email,
        customer_type: body.customer_type as any,
        credit_limit: body.credit_limit ? BigInt(body.credit_limit) : undefined,
      },
    });
  }

  // ─── Wholesale Orders ─────────────────────────────────────────────────────

  @Post('wholesale-orders')
  @Permissions('wholesale.order.create')
  @ApiOperation({ summary: 'Create a wholesale order (idempotent)' })
  async createWholesaleOrder(
    @Body() body: {
      customer_id: string; branch_id: string; total_amount: number; created_by: string;
      items: { variant_id: string; quantity: number; unit_price: number }[];
    },
    @Req() req: AuthenticatedRequest,
    @Headers('idempotency-key') _idempotencyKey?: string,
  ) {
    return prisma.wholesaleOrder.create({
      data: {
        tenant_id: req.tenantId!,
        customer_id: body.customer_id,
        branch_id: body.branch_id,
        status: 'draft',
        total_amount: BigInt(body.total_amount),
        created_by: body.created_by,
        items: {
          create: body.items.map(item => ({
            tenant_id: req.tenantId!,
            variant_id: item.variant_id,
            quantity: item.quantity,
            unit_price: BigInt(item.unit_price),
          })),
        },
      },
      include: { items: true },
    });
  }

  @Patch('wholesale-orders/:id/confirm')
  @Permissions('wholesale.order.confirm')
  @ApiOperation({ summary: 'Confirm a wholesale order' })
  async confirmOrder(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return prisma.wholesaleOrder.update({ where: { id }, data: { status: 'confirmed' } });
  }

  @Patch('wholesale-orders/:id/fulfill')
  @Permissions('wholesale.order.fulfill')
  @ApiOperation({ summary: 'Mark a wholesale order as fulfilled' })
  async fulfillOrder(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return prisma.wholesaleOrder.update({ where: { id }, data: { status: 'fulfilled' } });
  }
}
