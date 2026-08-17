import { InventoryController } from './inventory.controller';
import { prisma } from '@repo/db';
import type { AuthenticatedRequest } from '../../common/types/request.types';

jest.mock('@repo/db', () => ({
  prisma: {
    warehouse: { findMany: jest.fn(), create: jest.fn() },
    product: { findMany: jest.fn(), create: jest.fn() },
    productVariant: { findMany: jest.fn() },
    stockLevel: { findMany: jest.fn(), upsert: jest.fn() },
    stockMovement: { create: jest.fn() },
    stockTransfer: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    $transaction: jest.fn((callback) => {
      if (typeof callback === 'function') {
        return callback({
          stockLevel: {
            upsert: jest.fn().mockResolvedValue({ id: 'sl-1', quantity_on_hand: 50 }),
          },
          stockMovement: {
            create: jest.fn().mockResolvedValue({ id: 'sm-1' }),
          },
        });
      }
      return Promise.all(callback);
    }),
  },
}));

describe('InventoryController Unit Tests', () => {
  let controller: InventoryController;
  const mockReq = { tenantId: 'tenant-1', auth: { userId: 'clerk-user-1' } } as unknown as AuthenticatedRequest;

  beforeEach(() => {
    controller = new InventoryController();
    jest.clearAllMocks();
  });

  describe('Warehouses', () => {
    it('should list warehouses for tenant', async () => {
      (prisma.warehouse.findMany as jest.Mock).mockResolvedValue([{ id: 'wh-1', name: 'Main Store' }]);
      const result = await controller.getWarehouses(mockReq);
      expect(result).toHaveLength(1);
    });

    it('should create a warehouse', async () => {
      (prisma.warehouse.create as jest.Mock).mockResolvedValue({ id: 'wh-1', name: 'Retail Store' });
      const result = await controller.createWarehouse({ name: 'Retail Store', type: 'retail_branch' }, mockReq);
      expect(result.name).toBe('Retail Store');
    });
  });

  describe('Products & Variants', () => {
    it('should list active products with variants', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([{ id: 'p-1', sku: 'SKU-001', variants: [] }]);
      const result = await controller.getProducts(mockReq);
      expect(result).toHaveLength(1);
    });

    it('should create product', async () => {
      (prisma.product.create as jest.Mock).mockResolvedValue({ id: 'p-1', sku: 'SKU-NEW', name: 'Cotton Shirt' });
      const result = await controller.createProduct({ sku: 'SKU-NEW', name: 'Cotton Shirt', unit: 'piece' }, mockReq);
      expect(result.sku).toBe('SKU-NEW');
    });

    it('should list variants for a product', async () => {
      (prisma.productVariant.findMany as jest.Mock).mockResolvedValue([{ id: 'v-1', size: 'L', color: 'Blue' }]);
      const result = await controller.getVariants('p-1', mockReq);
      expect(result).toHaveLength(1);
    });
  });

  describe('Stock Operations', () => {
    it('should get current stock levels', async () => {
      (prisma.stockLevel.findMany as jest.Mock).mockResolvedValue([{ id: 'sl-1', quantity_on_hand: 100 }]);
      const result = await controller.getStock(mockReq);
      expect(result).toHaveLength(1);
    });

    it('should adjust stock level inside transaction', async () => {
      const result = await controller.adjustStock(
        { warehouse_id: 'wh-1', variant_id: 'v-1', quantity: 20, reason: 'restock', moved_by: 'user-1' },
        mockReq,
      );
      expect(result.id).toBe('sl-1');
    });

    it('should create a stock transfer with idempotency', async () => {
      (prisma.stockTransfer.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.stockTransfer.create as jest.Mock).mockResolvedValue({ id: 'st-1', status: 'pending' });
      const result = await controller.createTransfer(
        { from_warehouse_id: 'wh-1', to_warehouse_id: 'wh-2', initiated_by: 'user-1', idempotency_key: 'st-key-1' },
        mockReq,
      );
      expect(result.id).toBe('st-1');
    });

    it('should receive a stock transfer', async () => {
      (prisma.stockTransfer.findFirst as jest.Mock).mockResolvedValue({ id: 'st-1', status: 'pending' });
      (prisma.stockTransfer.update as jest.Mock).mockResolvedValue({ id: 'st-1', status: 'received' });
      const result = await controller.receiveTransfer('st-1', { received_by: 'user-2' }, mockReq);
      expect(result.status).toBe('received');
    });

    it('should return low stock alerts when quantity <= reorder_point', async () => {
      (prisma.stockLevel.findMany as jest.Mock).mockResolvedValue([
        { id: 'sl-low', quantity_on_hand: 5, reorder_point: 10 },
        { id: 'sl-ok', quantity_on_hand: 50, reorder_point: 10 },
      ]);
      const result = await controller.getLowStockAlerts(mockReq);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('sl-low');
    });
  });
});
