import { HrController } from './hr.controller';
import { prisma } from '@repo/db';
import type { AuthenticatedRequest } from '../../common/types/request.types';

jest.mock('@repo/db', () => ({
  prisma: {
    employee: { findMany: jest.fn(), create: jest.fn() },
    attendanceLog: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    leaveRequest: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    payrollRun: { findUnique: jest.fn(), create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
  },
}));

describe('HrController Unit Tests', () => {
  let controller: HrController;
  const mockReq = { tenantId: 'tenant-1', auth: { userId: 'clerk-user-1' } } as unknown as AuthenticatedRequest;

  beforeEach(() => {
    controller = new HrController();
    jest.clearAllMocks();
  });

  describe('Employees', () => {
    it('should list employees', async () => {
      (prisma.employee.findMany as jest.Mock).mockResolvedValue([{ id: 'emp-1', full_name: 'Ahmed Khan' }]);
      const result = await controller.getEmployees(mockReq);
      expect(result).toHaveLength(1);
    });

    it('should create employee record', async () => {
      (prisma.employee.create as jest.Mock).mockResolvedValue({ id: 'emp-1', full_name: 'Ahmed Khan' });
      const result = await controller.createEmployee(
        { employee_code: 'EMP-01', full_name: 'Ahmed Khan', role_type: 'factory_worker', pay_type: 'fixed' },
        mockReq,
      );
      expect(result.full_name).toBe('Ahmed Khan');
    });
  });

  describe('Attendance', () => {
    it('should log employee clock-in', async () => {
      (prisma.attendanceLog.create as jest.Mock).mockResolvedValue({ id: 'att-1', employee_id: 'emp-1' });
      const result = await controller.clockIn({ employee_id: 'emp-1', source: 'biometric' }, mockReq);
      expect(result.id).toBe('att-1');
    });

    it('should log employee clock-out', async () => {
      (prisma.attendanceLog.findFirst as jest.Mock).mockResolvedValue({ id: 'att-1' });
      (prisma.attendanceLog.update as jest.Mock).mockResolvedValue({ id: 'att-1', check_out: new Date() });
      const result = await controller.clockOut('att-1', mockReq);
      expect(result.check_out).toBeDefined();
    });
  });

  describe('Leave Requests', () => {
    it('should list and submit leave requests', async () => {
      (prisma.leaveRequest.findMany as jest.Mock).mockResolvedValue([{ id: 'leave-1' }]);
      const list = await controller.getLeaveRequests(mockReq);
      expect(list).toHaveLength(1);

      (prisma.leaveRequest.create as jest.Mock).mockResolvedValue({ id: 'leave-1', status: 'pending' });
      const created = await controller.submitLeaveRequest(
        { employee_id: 'emp-1', type: 'annual', start_date: '2026-09-01', end_date: '2026-09-05' },
        mockReq,
      );
      expect(created.status).toBe('pending');
    });

    it('should approve leave request', async () => {
      (prisma.leaveRequest.findFirst as jest.Mock).mockResolvedValue({ id: 'leave-1' });
      (prisma.leaveRequest.update as jest.Mock).mockResolvedValue({ id: 'leave-1', status: 'approved' });
      const result = await controller.approveLeaveRequest('leave-1', { status: 'approved', approved_by: 'mgr-1' }, mockReq);
      expect(result.status).toBe('approved');
    });
  });

  describe('Payroll Runs', () => {
    it('should initialize payroll run with idempotency check', async () => {
      (prisma.payrollRun.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.payrollRun.create as jest.Mock).mockResolvedValue({ id: 'pr-1', status: 'draft' });
      const result = await controller.runPayroll(
        { period_start: '2026-08-01', period_end: '2026-08-31', idempotency_key: 'pr-aug-2026' },
        mockReq,
      );
      expect(result.status).toBe('draft');
    });

    it('should return existing payroll run if idempotency key exists', async () => {
      (prisma.payrollRun.findUnique as jest.Mock).mockResolvedValue({ id: 'pr-existing', status: 'draft' });
      const result = await controller.runPayroll(
        { period_start: '2026-08-01', period_end: '2026-08-31', idempotency_key: 'pr-aug-2026' },
        mockReq,
      );
      expect(result.id).toBe('pr-existing');
    });

    it('should approve payroll run', async () => {
      (prisma.payrollRun.findFirst as jest.Mock).mockResolvedValue({ id: 'pr-1' });
      (prisma.payrollRun.update as jest.Mock).mockResolvedValue({ id: 'pr-1', status: 'approved' });
      const result = await controller.approvePayroll('pr-1', mockReq);
      expect(result.status).toBe('approved');
    });
  });
});
