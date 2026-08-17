import { SalesController } from './sales.controller';
import { prisma } from '@repo/db';
import type { AuthenticatedRequest } from '../../common/types/request.types';

jest.mock('@repo/db', () => ({
  prisma: {
    posTerminal: { findMany: jest.fn() },
    posTransaction: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn() },
    customer: { findMany: jest.fn(), create: jest.fn() },
    wholesaleOrder: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    $transaction: jest.fn((callback) => {
      if (typeof callback === 'function') {
        return callback({
          posTransaction: {
            create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'txn-1', ...data })),
          },
          wholesaleOrder: {
            create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'order-1', ...data })),
          },
        });
      }
      return Promise.all(callback);
    }),
  },
}));

describe('SalesController Unit Tests', () => {
  let controller: SalesController;
  const mockReq = { tenantId: 'tenant-1', auth: { userId: 'clerk-user-1' } } as unknown as AuthenticatedRequest;

  beforeEach(() => {
    controller = new SalesController();
    jest.clearAllMocks();
  });

  describe('POS Terminals', () => {
    it('should list POS terminals for the tenant', async () => {
      (prisma.posTerminal.findMany as jest.Mock).mockResolvedValue([{ id: 'term-1', terminal_code: 'POS-01' }]);
      const result = await controller.getTerminals(mockReq);
      expect(result).toEqual([{ id: 'term-1', terminal_code: 'POS-01' }]);
      expect(prisma.posTerminal.findMany).toHaveBeenCalledWith({ where: { tenant_id: 'tenant-1' } });
    });
  });

  describe('POS Transactions', () => {
    it('should return existing transaction when idempotency key is matched', async () => {
      (prisma.posTransaction.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-txn', idempotency_key: 'idem-1' });
      const result = await controller.createTransaction(
        {
          branch_id: 'b-1', terminal_id: 't-1', cashier_id: 'c-1', idempotency_key: 'idem-1',
          subtotal: 100, tax_amount: 10, discount_amount: 0, total: 110, payment_method: 'cash',
          items: [{ variant_id: 'v-1', quantity: 1, unit_price: 100 }],
        },
        mockReq,
      );
      expect(result).toEqual({ id: 'existing-txn', idempotency_key: 'idem-1' });
    });

    it('should list transactions for tenant', async () => {
      (prisma.posTransaction.findMany as jest.Mock).mockResolvedValue([{ id: 'txn-1', total: BigInt(100) }]);
      const result = await controller.getTransactions(mockReq);
      expect(result).toHaveLength(1);
    });
  });

  describe('Customers', () => {
    it('should list customers for tenant', async () => {
      (prisma.customer.findMany as jest.Mock).mockResolvedValue([{ id: 'cust-1', name: 'John Doe' }]);
      const result = await controller.getCustomers(mockReq);
      expect(result).toHaveLength(1);
    });

    it('should create customer', async () => {
      (prisma.customer.create as jest.Mock).mockResolvedValue({ id: 'cust-1', name: 'Jane Doe' });
      const result = await controller.createCustomer(
        { name: 'Jane Doe', phone: '1234567890', customer_type: 'retail' },
        mockReq,
      );
      expect(result.name).toBe('Jane Doe');
    });
  });

  describe('Wholesale Orders', () => {
    it('should create wholesale order with idempotency check', async () => {
      (prisma.wholesaleOrder.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await controller.createWholesaleOrder(
        {
          customer_id: 'cust-1', branch_id: 'b-1', total_amount: 5000, created_by: 'user-1',
          idempotency_key: 'order-key-1', items: [{ variant_id: 'v-1', quantity: 10, unit_price: 500 }],
        },
        mockReq,
      );
      expect(result.id).toBe('order-1');
    });

    it('should return existing wholesale order if idempotency key matches', async () => {
      (prisma.wholesaleOrder.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-order', idempotency_key: 'order-key-1' });
      const result = await controller.createWholesaleOrder(
        {
          customer_id: 'cust-1', branch_id: 'b-1', total_amount: 5000, created_by: 'user-1',
          idempotency_key: 'order-key-1', items: [],
        },
        mockReq,
      );
      expect(result.id).toBe('existing-order');
    });

    it('should confirm wholesale order', async () => {
      (prisma.wholesaleOrder.update as jest.Mock).mockResolvedValue({ id: 'order-1', status: 'confirmed' });
      const result = await controller.confirmOrder('order-1', mockReq);
      expect(result.status).toBe('confirmed');
    });

    it('should fulfill wholesale order', async () => {
      (prisma.wholesaleOrder.update as jest.Mock).mockResolvedValue({ id: 'order-1', status: 'fulfilled' });
      const result = await controller.fulfillOrder('order-1', mockReq);
      expect(result.status).toBe('fulfilled');
    });
  });
});
