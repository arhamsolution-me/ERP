import { FinanceController } from './finance.controller';
import { prisma } from '@repo/db';
import type { AuthenticatedRequest } from '../../common/types/request.types';

jest.mock('@repo/db', () => ({
  prisma: {
    invoice: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), aggregate: jest.fn() },
    payment: { findUnique: jest.fn(), create: jest.fn(), aggregate: jest.fn() },
    bankReconciliation: { findMany: jest.fn(), create: jest.fn() },
    exportDocument: { create: jest.fn() },
  },
}));

describe('FinanceController Unit Tests', () => {
  let controller: FinanceController;
  const mockReq = { tenantId: 'tenant-1', auth: { userId: 'clerk-user-1' } } as unknown as AuthenticatedRequest;

  beforeEach(() => {
    controller = new FinanceController();
    jest.clearAllMocks();
  });

  describe('Invoices', () => {
    it('should list invoices', async () => {
      (prisma.invoice.findMany as jest.Mock).mockResolvedValue([{ id: 'inv-1', invoice_number: 'INV-001' }]);
      const result = await controller.getInvoices(mockReq);
      expect(result).toHaveLength(1);
    });

    it('should create an invoice idempotently', async () => {
      (prisma.invoice.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.invoice.create as jest.Mock).mockResolvedValue({ id: 'inv-1', invoice_number: 'INV-NEW' });
      const result = await controller.createInvoice(
        { invoice_number: 'INV-NEW', entity_type: 'sale', amount: 1000, tax_amount: 100 },
        mockReq,
      );
      expect(result.invoice_number).toBe('INV-NEW');
    });

    it('should return existing invoice if invoice_number already exists', async () => {
      (prisma.invoice.findUnique as jest.Mock).mockResolvedValue({ id: 'inv-existing', invoice_number: 'INV-001' });
      const result = await controller.createInvoice(
        { invoice_number: 'INV-001', entity_type: 'sale', amount: 1000, tax_amount: 100 },
        mockReq,
      );
      expect(result.id).toBe('inv-existing');
    });
  });

  describe('Payments', () => {
    it('should record a payment with idempotency', async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.payment.create as jest.Mock).mockResolvedValue({ id: 'pay-1', amount: BigInt(500) });
      const result = await controller.recordPayment(
        { amount: 500, method: 'cash', idempotency_key: 'pay-key-1' },
        mockReq,
      );
      expect(result.id).toBe('pay-1');
    });

    it('should return existing payment if idempotency key exists', async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue({ id: 'pay-existing', amount: BigInt(500) });
      const result = await controller.recordPayment(
        { amount: 500, method: 'cash', idempotency_key: 'pay-key-1' },
        mockReq,
      );
      expect(result.id).toBe('pay-existing');
    });
  });

  describe('Bank Reconciliation', () => {
    it('should list reconciliation records', async () => {
      (prisma.bankReconciliation.findMany as jest.Mock).mockResolvedValue([{ id: 'rec-1' }]);
      const result = await controller.getReconciliation(mockReq);
      expect(result).toHaveLength(1);
    });

    it('should match a bank statement line to a payment', async () => {
      (prisma.bankReconciliation.create as jest.Mock).mockResolvedValue({ id: 'rec-1', status: 'matched' });
      const result = await controller.matchReconciliation(
        { bank_account_id: 'ba-1', statement_line_ref: 'STMT-001', matched_payment_id: 'pay-1' },
        mockReq,
      );
      expect(result.status).toBe('matched');
    });
  });

  describe('Reports', () => {
    it('should generate PnL summary report', async () => {
      (prisma.invoice.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: BigInt(10000), tax_amount: BigInt(1500) },
      });
      (prisma.payment.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: BigInt(8500) },
      });

      const result = await controller.getPnl(mockReq);
      expect(result.total_invoiced).toBe('10000');
      expect(result.total_tax).toBe('1500');
      expect(result.total_received).toBe('8500');
    });
  });
});
