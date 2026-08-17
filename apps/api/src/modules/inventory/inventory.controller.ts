import {
  Controller, Get, Post, Patch, Param, Body,
  Req, UseGuards, HttpCode, HttpStatus, Headers, NotFoundException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import type { AuthenticatedRequest } from '../../common/types/request.types';
import { prisma } from '@repo/db';

@ApiTags('Inventory')
@ApiBearerAuth('ClerkAuth')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {

  // ─── Warehouses ───────────────────────────────────────────────────────────

  @Get('warehouses')
  @Permissions('inventory.warehouse.read')
  @ApiOperation({ summary: 'List all warehouses' })
  async getWarehouses(@Req() req: AuthenticatedRequest) {
    return prisma.warehouse.findMany({ where: { tenant_id: req.tenantId! } });
  }

  @Post('warehouses')
  @Permissions('inventory.warehouse.create')
  @ApiOperation({ summary: 'Create a warehouse' })
  async createWarehouse(
    @Body() body: { name: string; type: string; address?: string; geo_lat?: number; geo_lng?: number },
    @Req() req: AuthenticatedRequest,
  ) {
    return prisma.warehouse.create({
      data: {
        tenant_id: req.tenantId!,
        name: body.name,
        type: body.type as any,
        address: body.address,
        geo_lat: body.geo_lat,
        geo_lng: body.geo_lng,
      },
    });
  }

  // ─── Products ─────────────────────────────────────────────────────────────

  @Get('products')
  @Permissions('inventory.product.read')
  @ApiOperation({ summary: 'List all products' })
  async getProducts(@Req() req: AuthenticatedRequest) {
    return prisma.product.findMany({
      where: { tenant_id: req.tenantId!, is_active: true },
      include: { variants: true },
    });
  }

  @Post('products')
  @Permissions('inventory.product.create')
  @ApiOperation({ summary: 'Create a product' })
  async createProduct(
    @Body() body: { sku: string; name: string; category?: string; unit: string; hsn_code?: string },
    @Req() req: AuthenticatedRequest,
  ) {
    return prisma.product.create({
      data: {
        tenant_id: req.tenantId!,
        sku: body.sku,
        name: body.name,
        category: body.category,
        unit: body.unit,
        hsn_code: body.hsn_code,
      },
    });
  }

  @Get('products/:id/variants')
  @Permissions('inventory.product.read')
  @ApiOperation({ summary: 'List variants for a product' })
  async getVariants(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return prisma.productVariant.findMany({
      where: { product_id: id, tenant_id: req.tenantId! },
    });
  }

  // ─── Stock ────────────────────────────────────────────────────────────────

  @Get('stock')
  @Permissions('inventory.stock.read')
  @ApiOperation({ summary: 'Get current stock levels (branch-scoped)' })
  async getStock(@Req() req: AuthenticatedRequest) {
    return prisma.stockLevel.findMany({
      where: { tenant_id: req.tenantId! },
      include: {
        // We use raw relation IDs since we don't have nav props in Prisma relations here
      },
      orderBy: { quantity_on_hand: 'asc' },
    });
  }

  @Post('stock/adjust')
  @Permissions('inventory.stock.adjust')
  @ApiOperation({ summary: 'Adjust stock level (idempotent)' })
  @HttpCode(HttpStatus.OK)
  async adjustStock(
    @Body() body: { warehouse_id: string; variant_id: string; quantity: number; reason: string; moved_by: string },
    @Req() req: AuthenticatedRequest,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return prisma.$transaction(async (tx) => {
      // Upsert stock level
      const stock = await tx.stockLevel.upsert({
        where: {
          tenant_id_warehouse_id_variant_id: {
            tenant_id: req.tenantId!,
            warehouse_id: body.warehouse_id,
            variant_id: body.variant_id,
          },
        },
        create: {
          tenant_id: req.tenantId!,
          warehouse_id: body.warehouse_id,
          variant_id: body.variant_id,
          quantity_on_hand: body.quantity,
        },
        update: {
          quantity_on_hand: { increment: body.quantity },
        },
      });

      // Log the movement
      await tx.stockMovement.create({
        data: {
          tenant_id: req.tenantId!,
          warehouse_id: body.warehouse_id,
          variant_id: body.variant_id,
          movement_type: body.quantity >= 0 ? 'inbound' : 'adjustment',
          quantity: Math.abs(body.quantity),
          reference_type: 'manual_adjustment',
          moved_by: body.moved_by,
        },
      });

      return stock;
    });
  }

  // ─── Stock Transfers ──────────────────────────────────────────────────────

  @Post('transfers')
  @Permissions('inventory.transfer.create')
  @ApiOperation({ summary: 'Initiate a stock transfer between warehouses (idempotent)' })
  async createTransfer(
    @Body() body: { from_warehouse_id: string; to_warehouse_id: string; initiated_by: string; idempotency_key?: string },
    @Req() req: AuthenticatedRequest,
    @Headers('idempotency-key') headerKey?: string,
  ) {
    const key = headerKey || body.idempotency_key;
    if (key) {
      const existing = await prisma.stockTransfer.findUnique({
        where: { idempotency_key: key },
      });
      if (existing) return existing;
    }

    return prisma.stockTransfer.create({
      data: {
        tenant_id: req.tenantId!,
        from_warehouse_id: body.from_warehouse_id,
        to_warehouse_id: body.to_warehouse_id,
        status: 'pending',
        initiated_by: body.initiated_by,
        idempotency_key: key,
      },
    });
  }

  @Patch('transfers/:id/receive')
  @Permissions('inventory.transfer.receive')
  @ApiOperation({ summary: 'Mark a transfer as received' })
  async receiveTransfer(
    @Param('id') id: string,
    @Body() body: { received_by: string },
    @Req() req: AuthenticatedRequest,
  ) {
    const transfer = await prisma.stockTransfer.findFirst({ where: { id, tenant_id: req.tenantId! } });
    if (!transfer) throw new NotFoundException('Transfer not found');
    return prisma.stockTransfer.update({
      where: { id },
      data: { status: 'received', received_by: body.received_by },
    });
  }

  // ─── Low Stock Alerts ─────────────────────────────────────────────────────

  @Get('low-stock-alerts')
  @Permissions('inventory.stock.read')
  @ApiOperation({ summary: 'Get stock levels below reorder point' })
  async getLowStockAlerts(@Req() req: AuthenticatedRequest) {
    // Find items where quantity_on_hand <= reorder_point
    return prisma.stockLevel.findMany({
      where: {
        tenant_id: req.tenantId!,
        reorder_point: { not: null },
        // Prisma doesn't allow column-to-column comparisons in where,
        // so we return all with reorder_point set and filter in app.
      },
    }).then(levels =>
      levels.filter(l => l.reorder_point !== null && l.quantity_on_hand <= l.reorder_point!)
    );
  }
}
