import { SalesController } from './sales.controller';
import { prisma } from '@repo/db';
import type { AuthenticatedRequest } from '../../common/types/request.types';

jest.mock('@repo/db', () => ({
  prisma: {
    posTransaction: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback({
      posTransaction: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({
          id: 'txn-created-uuid',
          ...data,
        })),
      },
    })),
  },
}));

describe('Offline-First POS Sync & Conflict Resolution Suite', () => {
  let controller: SalesController;
  const mockReq = {
    tenantId: 'tenant-pos-123',
    auth: { userId: 'cashier-clerk-1' },
  } as unknown as AuthenticatedRequest;

  beforeEach(() => {
    controller = new SalesController();
    jest.clearAllMocks();
  });

  it('should process and sync offline batch transactions cleanly', async () => {
    (prisma.posTransaction.findUnique as jest.Mock).mockResolvedValue(null);

    const payload = {
      transactions: [
        {
          branch_id: 'branch-1',
          terminal_id: 'term-1',
          cashier_id: 'cashier-1',
          idempotency_key: 'offline-txn-key-1',
          subtotal: 1000,
          tax_amount: 150,
          discount_amount: 50,
          total: 1100,
          payment_method: 'cash',
          offline_created_at: new Date().toISOString(),
          items: [{ variant_id: 'var-1', quantity: 2, unit_price: 500 }],
        },
        {
          branch_id: 'branch-1',
          terminal_id: 'term-1',
          cashier_id: 'cashier-1',
          idempotency_key: 'offline-txn-key-2',
          subtotal: 2000,
          tax_amount: 300,
          discount_amount: 0,
          total: 2300,
          payment_method: 'card',
          offline_created_at: new Date().toISOString(),
          items: [{ variant_id: 'var-2', quantity: 1, unit_price: 2000 }],
        },
      ],
    };

    const result = await controller.syncBatch(payload, mockReq);

    expect(result.total_processed).toBe(2);
    expect(result.synced_count).toBe(2);
    expect(result.duplicates_count).toBe(0);
    expect(result.conflicts_count).toBe(0);
    expect(result.results[0].status).toBe('synced');
    expect(result.results[1].status).toBe('synced');
  });

  it('should detect duplicate offline transactions and report them without error', async () => {
    (prisma.posTransaction.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 'existing-txn-uuid',
      idempotency_key: 'offline-txn-key-duplicate',
    });

    const payload = {
      transactions: [
        {
          branch_id: 'branch-1',
          terminal_id: 'term-1',
          cashier_id: 'cashier-1',
          idempotency_key: 'offline-txn-key-duplicate',
          subtotal: 1000,
          tax_amount: 150,
          discount_amount: 0,
          total: 1150,
          payment_method: 'cash',
          items: [{ variant_id: 'var-1', quantity: 1, unit_price: 1000 }],
        },
      ],
    };

    const result = await controller.syncBatch(payload, mockReq);

    expect(result.total_processed).toBe(1);
    expect(result.synced_count).toBe(0);
    expect(result.duplicates_count).toBe(1);
    expect(result.results[0].status).toBe('duplicate');
    expect(result.results[0].transaction_id).toBe('existing-txn-uuid');
  });

  it('should handle mixed batch with new and duplicate transactions correctly', async () => {
    (prisma.posTransaction.findUnique as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'existing-2', idempotency_key: 'key-dup' });

    const payload = {
      transactions: [
        {
          branch_id: 'branch-1',
          terminal_id: 'term-1',
          cashier_id: 'cashier-1',
          idempotency_key: 'key-new',
          subtotal: 500,
          tax_amount: 50,
          discount_amount: 0,
          total: 550,
          payment_method: 'cash',
          items: [{ variant_id: 'var-1', quantity: 1, unit_price: 500 }],
        },
        {
          branch_id: 'branch-1',
          terminal_id: 'term-1',
          cashier_id: 'cashier-1',
          idempotency_key: 'key-dup',
          subtotal: 500,
          tax_amount: 50,
          discount_amount: 0,
          total: 550,
          payment_method: 'cash',
          items: [{ variant_id: 'var-1', quantity: 1, unit_price: 500 }],
        },
      ],
    };

    const result = await controller.syncBatch(payload, mockReq);

    expect(result.total_processed).toBe(2);
    expect(result.synced_count).toBe(1);
    expect(result.duplicates_count).toBe(1);
  });
});
