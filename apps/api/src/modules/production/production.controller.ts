import {
  Controller, Get, Post, Patch, Param, Body,
  Req, UseGuards, HttpCode, HttpStatus, Headers
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import type { AuthenticatedRequest } from '../../common/types/request.types';
import { prisma } from '@repo/db';

@ApiTags('Production')
@ApiBearerAuth('ClerkAuth')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Controller('production')
export class ProductionController {

  // ─── Materials ────────────────────────────────────────────────────────────

  @Get('materials')
  @Permissions('production.material.read')
  @ApiOperation({ summary: 'List all raw materials' })
  async getMaterials(@Req() req: AuthenticatedRequest) {
    return prisma.rawMaterial.findMany({
      where: { tenant_id: req.tenantId! },
      include: { lots: { orderBy: { received_at: 'desc' }, take: 5 } },
    });
  }

  @Post('materials')
  @Permissions('production.material.create')
  @ApiOperation({ summary: 'Create a raw material' })
  async createMaterial(
    @Body() body: { name: string; category: string; unit: string; reorder_threshold: number },
    @Req() req: AuthenticatedRequest,
  ) {
    return prisma.rawMaterial.create({
      data: {
        tenant_id: req.tenantId!,
        name: body.name,
        category: body.category as any,
        unit: body.unit as any,
        reorder_threshold: body.reorder_threshold,
      },
    });
  }

  @Post('materials/:id/lots')
  @Permissions('production.material.receive')
  @ApiOperation({ summary: 'Receive a material lot from supplier' })
  async receiveLot(
    @Param('id') id: string,
    @Body() body: { supplier_id: string; lot_number: string; quantity_received: number; unit_cost: number },
    @Req() req: AuthenticatedRequest,
  ) {
    return prisma.materialLot.create({
      data: {
        tenant_id: req.tenantId!,
        raw_material_id: id,
        supplier_id: body.supplier_id,
        lot_number: body.lot_number,
        quantity_received: body.quantity_received,
        quantity_remaining: body.quantity_received,
        unit_cost: BigInt(body.unit_cost),
        received_at: new Date(),
      },
    });
  }

  // ─── Production Batches ───────────────────────────────────────────────────

  @Get('batches')
  @Permissions('production.batch.read')
  @ApiOperation({ summary: 'List production batches' })
  async getBatches(@Req() req: AuthenticatedRequest) {
    return prisma.productionBatch.findMany({
      where: { tenant_id: req.tenantId! },
      include: { logs: { orderBy: { started_at: 'desc' }, take: 3 }, quality_checks: true },
      orderBy: { started_at: 'desc' },
    });
  }

  @Post('batches')
  @Permissions('production.batch.create')
  @ApiOperation({ summary: 'Create a production batch' })
  async createBatch(
    @Body() body: { batch_number: string; product_type: string; mill_id: string; planned_quantity: number },
    @Req() req: AuthenticatedRequest,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return prisma.productionBatch.create({
      data: {
        tenant_id: req.tenantId!,
        batch_number: body.batch_number,
        product_type: body.product_type,
        mill_id: body.mill_id,
        current_stage: 'spinning',
        planned_quantity: body.planned_quantity,
        started_at: new Date(),
        status: 'active',
      },
    });
  }

  @Get('batches/:id')
  @Permissions('production.batch.read')
  @ApiOperation({ summary: 'Get a production batch by ID' })
  async getBatch(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return prisma.productionBatch.findFirst({
      where: { id, tenant_id: req.tenantId! },
      include: { logs: true, quality_checks: true },
    });
  }

  @Patch('batches/:id/stage')
  @Permissions('production.batch.update_stage')
  @ApiOperation({ summary: 'Advance a batch to the next stage' })
  async updateStage(
    @Param('id') id: string,
    @Body() body: { stage: string; supervisor_id: string; machine_id?: string; notes?: string },
    @Req() req: AuthenticatedRequest,
  ) {
    return prisma.$transaction(async (tx) => {
      const batch = await tx.productionBatch.update({
        where: { id },
        data: { current_stage: body.stage as any },
      });
      await tx.batchStageLog.create({
        data: {
          tenant_id: req.tenantId!,
          batch_id: id,
          stage: body.stage,
          supervisor_id: body.supervisor_id,
          machine_id: body.machine_id,
          started_at: new Date(),
          notes: body.notes,
        },
      });
      return batch;
    });
  }

  // ─── Quality Control ───────────────────────────────────────────────────────

  @Post('batches/:id/qc')
  @Permissions('production.qc.create')
  @ApiOperation({ summary: 'Record a quality check for a batch' })
  async createQc(
    @Param('id') id: string,
    @Body() body: { inspector_id: string; checkpoint_stage: string; result: string; defect_type?: string; image_url?: string },
    @Req() req: AuthenticatedRequest,
  ) {
    return prisma.qualityCheck.create({
      data: {
        tenant_id: req.tenantId!,
        batch_id: id,
        checkpoint_stage: body.checkpoint_stage,
        inspector_id: body.inspector_id,
        result: body.result as any,
        defect_type: body.defect_type,
        image_url: body.image_url,
        checked_at: new Date(),
      },
    });
  }

  // ─── Machines ─────────────────────────────────────────────────────────────

  @Get('machines')
  @Permissions('production.machine.read')
  @ApiOperation({ summary: 'List all machines' })
  async getMachines(@Req() req: AuthenticatedRequest) {
    return prisma.machine.findMany({
      where: { tenant_id: req.tenantId! },
      include: { downtime_logs: { orderBy: { started_at: 'desc' }, take: 3 } },
    });
  }

  @Post('machines/:id/downtime')
  @Permissions('production.machine.log_downtime')
  @ApiOperation({ summary: 'Log machine downtime' })
  async logDowntime(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Req() req: AuthenticatedRequest,
  ) {
    return prisma.machineDowntimeLog.create({
      data: {
        tenant_id: req.tenantId!,
        machine_id: id,
        reason: body.reason,
        started_at: new Date(),
      },
    });
  }

  // ─── Dyeing Recipes ───────────────────────────────────────────────────────

  @Get('dyeing-recipes')
  @Permissions('production.recipe.read')
  @ApiOperation({ summary: 'List dyeing recipes' })
  async getDyeingRecipes(@Req() req: AuthenticatedRequest) {
    return prisma.dyeingRecipe.findMany({ where: { tenant_id: req.tenantId! } });
  }

  @Post('dyeing-recipes')
  @Permissions('production.recipe.create')
  @ApiOperation({ summary: 'Create a dyeing recipe' })
  async createDyeingRecipe(
    @Body() body: { name: string; color_code: string; chemical_composition_json: object },
    @Req() req: AuthenticatedRequest,
  ) {
    return prisma.dyeingRecipe.create({
      data: {
        tenant_id: req.tenantId!,
        name: body.name,
        color_code: body.color_code,
        chemical_composition_json: body.chemical_composition_json,
      },
    });
  }
}
