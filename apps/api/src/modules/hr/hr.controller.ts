import {
  Controller, Get, Post, Patch, Param, Body,
  Req, UseGuards, Headers, NotFoundException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import type { AuthenticatedRequest } from '../../common/types/request.types';
import { prisma } from '@repo/db';

@ApiTags('HR & Payroll')
@ApiBearerAuth('ClerkAuth')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Controller('hr')
export class HrController {

  // ─── Employees ────────────────────────────────────────────────────────────

  @Get('employees')
  @Permissions('hr.employee.read')
  @ApiOperation({ summary: 'List all employees' })
  async getEmployees(@Req() req: AuthenticatedRequest) {
    return prisma.employee.findMany({ where: { tenant_id: req.tenantId! } });
  }

  @Post('employees')
  @Permissions('hr.employee.create')
  @ApiOperation({ summary: 'Create an employee record' })
  async createEmployee(
    @Body() body: {
      employee_code: string; full_name: string; role_type: string;
      base_rate?: number; pay_type: string; branch_id?: string;
    },
    @Req() req: AuthenticatedRequest,
  ) {
    return prisma.employee.create({
      data: {
        tenant_id: req.tenantId!,
        employee_code: body.employee_code,
        full_name: body.full_name,
        role_type: body.role_type as any,
        base_rate: body.base_rate ? BigInt(body.base_rate) : undefined,
        pay_type: body.pay_type as any,
        branch_id: body.branch_id,
      },
    });
  }

  // ─── Attendance ───────────────────────────────────────────────────────────

  @Post('attendance/clock-in')
  @Permissions('hr.attendance.log')
  @ApiOperation({ summary: 'Log employee clock-in' })
  async clockIn(
    @Body() body: { employee_id: string; source: string },
    @Req() req: AuthenticatedRequest,
  ) {
    return prisma.attendanceLog.create({
      data: {
        tenant_id: req.tenantId!,
        employee_id: body.employee_id,
        check_in: new Date(),
        source: body.source as any,
      },
    });
  }

  @Patch('attendance/:id/clock-out')
  @Permissions('hr.attendance.log')
  @ApiOperation({ summary: 'Log employee clock-out' })
  async clockOut(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const log = await prisma.attendanceLog.findFirst({ where: { id, tenant_id: req.tenantId! } });
    if (!log) throw new NotFoundException('Attendance log not found');
    return prisma.attendanceLog.update({
      where: { id },
      data: { check_out: new Date() },
    });
  }

  // ─── Leave Requests ───────────────────────────────────────────────────────

  @Get('leave-requests')
  @Permissions('hr.leave.read')
  @ApiOperation({ summary: 'List leave requests' })
  async getLeaveRequests(@Req() req: AuthenticatedRequest) {
    return prisma.leaveRequest.findMany({ where: { tenant_id: req.tenantId! } });
  }

  @Post('leave-requests')
  @Permissions('hr.leave.create')
  @ApiOperation({ summary: 'Submit a leave request' })
  async submitLeaveRequest(
    @Body() body: { employee_id: string; type: string; start_date: string; end_date: string },
    @Req() req: AuthenticatedRequest,
  ) {
    return prisma.leaveRequest.create({
      data: {
        tenant_id: req.tenantId!,
        employee_id: body.employee_id,
        type: body.type,
        start_date: new Date(body.start_date),
        end_date: new Date(body.end_date),
        status: 'pending',
      },
    });
  }

  @Patch('leave-requests/:id/approve')
  @Permissions('hr.leave.approve')
  @ApiOperation({ summary: 'Approve or reject a leave request' })
  async approveLeaveRequest(
    @Param('id') id: string,
    @Body() body: { status: string; approved_by: string },
    @Req() req: AuthenticatedRequest,
  ) {
    const leave = await prisma.leaveRequest.findFirst({ where: { id, tenant_id: req.tenantId! } });
    if (!leave) throw new NotFoundException('Leave request not found');
    return prisma.leaveRequest.update({
      where: { id },
      data: { status: body.status, approved_by: body.approved_by },
    });
  }

  // ─── Payroll ──────────────────────────────────────────────────────────────

  @Post('payroll/run')
  @Permissions('hr.payroll.run')
  @ApiOperation({ summary: 'Initialize a payroll run' })
  async runPayroll(
    @Body() body: { period_start: string; period_end: string },
    @Req() req: AuthenticatedRequest,
  ) {
    return prisma.payrollRun.create({
      data: {
        tenant_id: req.tenantId!,
        period_start: new Date(body.period_start),
        period_end: new Date(body.period_end),
        status: 'draft' as any,
      },
    });
  }

  @Patch('payroll/run/:id/approve')
  @Permissions('hr.payroll.approve')
  @ApiOperation({ summary: 'Approve a payroll run' })
  async approvePayroll(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const run = await prisma.payrollRun.findFirst({ where: { id, tenant_id: req.tenantId! } });
    if (!run) throw new NotFoundException('Payroll run not found');
    return prisma.payrollRun.update({
      where: { id },
      data: { status: 'approved' as any },
    });
  }
}

