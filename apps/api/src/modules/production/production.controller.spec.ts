import { ProductionController } from './production.controller';
import { prisma } from '@repo/db';
import type { AuthenticatedRequest } from '../../common/types/request.types';

jest.mock('@repo/db', () => ({
  prisma: {
    rawMaterial: { findMany: jest.fn(), create: jest.fn() },
    materialLot: { create: jest.fn() },
    productionBatch: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
    qualityCheck: { create: jest.fn() },
    machine: { findMany: jest.fn() },
    machineDowntimeLog: { create: jest.fn() },
    dyeingRecipe: { findMany: jest.fn(), create: jest.fn() },
    $transaction: jest.fn((callback) => {
      if (typeof callback === 'function') {
        return callback({
          productionBatch: {
            update: jest.fn().mockResolvedValue({ id: 'batch-1', current_stage: 'weaving' }),
          },
          batchStageLog: {
            create: jest.fn().mockResolvedValue({ id: 'log-1' }),
          },
        });
      }
      return Promise.all(callback);
    }),
  },
}));

describe('ProductionController Unit Tests', () => {
  let controller: ProductionController;
  const mockReq = { tenantId: 'tenant-1', auth: { userId: 'clerk-user-1' } } as unknown as AuthenticatedRequest;

  beforeEach(() => {
    controller = new ProductionController();
    jest.clearAllMocks();
  });

  describe('Materials & Lots', () => {
    it('should list raw materials', async () => {
      (prisma.rawMaterial.findMany as jest.Mock).mockResolvedValue([{ id: 'mat-1', name: 'Cotton Yarn' }]);
      const result = await controller.getMaterials(mockReq);
      expect(result).toHaveLength(1);
    });

    it('should create raw material', async () => {
      (prisma.rawMaterial.create as jest.Mock).mockResolvedValue({ id: 'mat-1', name: 'Dye Blue' });
      const result = await controller.createMaterial(
        { name: 'Dye Blue', category: 'dye', unit: 'kg', reorder_threshold: 50 },
        mockReq,
      );
      expect(result.name).toBe('Dye Blue');
    });

    it('should receive material lot', async () => {
      (prisma.materialLot.create as jest.Mock).mockResolvedValue({ id: 'lot-1', lot_number: 'LOT-001' });
      const result = await controller.receiveLot(
        'mat-1',
        { supplier_id: 'sup-1', lot_number: 'LOT-001', quantity_received: 100, unit_cost: 200 },
        mockReq,
      );
      expect(result.lot_number).toBe('LOT-001');
    });
  });

  describe('Production Batches & Stages', () => {
    it('should list batches', async () => {
      (prisma.productionBatch.findMany as jest.Mock).mockResolvedValue([{ id: 'b-1', batch_number: 'BATCH-001' }]);
      const result = await controller.getBatches(mockReq);
      expect(result).toHaveLength(1);
    });

    it('should create production batch', async () => {
      (prisma.productionBatch.create as jest.Mock).mockResolvedValue({ id: 'b-1', batch_number: 'BATCH-001' });
      const result = await controller.createBatch(
        { batch_number: 'BATCH-001', product_type: 'denim', mill_id: 'mill-1', planned_quantity: 1000 },
        mockReq,
      );
      expect(result.batch_number).toBe('BATCH-001');
    });

    it('should advance batch stage within transaction', async () => {
      const result = await controller.updateStage(
        'b-1',
        { stage: 'weaving', supervisor_id: 'sup-1', machine_id: 'm-1' },
        mockReq,
      );
      expect(result.current_stage).toBe('weaving');
    });
  });

  describe('Quality Checks & Machines', () => {
    it('should record a QC check', async () => {
      (prisma.qualityCheck.create as jest.Mock).mockResolvedValue({ id: 'qc-1', result: 'pass' });
      const result = await controller.createQc(
        'b-1',
        { inspector_id: 'insp-1', checkpoint_stage: 'finishing', result: 'pass' },
        mockReq,
      );
      expect(result.result).toBe('pass');
    });

    it('should list machines', async () => {
      (prisma.machine.findMany as jest.Mock).mockResolvedValue([{ id: 'm-1', name: 'Loom 01' }]);
      const result = await controller.getMachines(mockReq);
      expect(result).toHaveLength(1);
    });

    it('should log machine downtime', async () => {
      (prisma.machineDowntimeLog.create as jest.Mock).mockResolvedValue({ id: 'dt-1', reason: 'Motor overheating' });
      const result = await controller.logDowntime('m-1', { reason: 'Motor overheating' }, mockReq);
      expect(result.reason).toBe('Motor overheating');
    });
  });

  describe('Dyeing Recipes', () => {
    it('should list and create dyeing recipes', async () => {
      (prisma.dyeingRecipe.findMany as jest.Mock).mockResolvedValue([{ id: 'r-1', name: 'Navy Blue 401' }]);
      const list = await controller.getDyeingRecipes(mockReq);
      expect(list).toHaveLength(1);

      (prisma.dyeingRecipe.create as jest.Mock).mockResolvedValue({ id: 'r-1', name: 'Navy Blue 401' });
      const created = await controller.createDyeingRecipe(
        { name: 'Navy Blue 401', color_code: '#000080', chemical_composition_json: { water: 80, dye: 20 } },
        mockReq,
      );
      expect(created.name).toBe('Navy Blue 401');
    });
  });
});
