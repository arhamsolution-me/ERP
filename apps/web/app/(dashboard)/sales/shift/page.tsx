'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  TrendingUp,
  ShoppingBag,
  Loader2,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

export default function PosShiftPage() {
  const [loading, setLoading] = useState(true);
  const [shiftData, setShiftData] = useState<any>(null);
  const [openingCash, setOpeningCash] = useState('5000');
  const [closingCash, setClosingCash] = useState('');
  const [supervisorNote, setSupervisorNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [closedSummary, setClosedSummary] = useState<any>(null);

  async function fetchShiftStatus() {
    try {
      setLoading(true);
      const res = await fetch('/api/sales/shifts/current');
      const data = await res.json();
      if (data.success) {
        setShiftData(data);
        if (data.hasActiveShift && data.activeShift) {
          setClosingCash(data.activeShift.runningMetrics?.currentExpectedCash || '');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchShiftStatus();
  }, []);

  async function handleOpenShift(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/sales/shifts/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openingCash: Number(openingCash) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to open shift');

      setStatusMsg({ type: 'success', text: 'Shift opened successfully! Cash drawer initialized.' });
      setClosedSummary(null);
      await fetchShiftStatus();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCloseShift(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/sales/shifts/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftId: shiftData?.activeShift?.id,
          closingCash: Number(closingCash),
          supervisorNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to close shift');

      setStatusMsg({ type: 'success', text: 'Shift closed and reconciled successfully.' });
      setClosedSummary(data.shiftSummary);
      await fetchShiftStatus();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 font-medium">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-sky-700" />
        Loading register shift status...
      </div>
    );
  }

  const hasActive = shiftData?.hasActiveShift && shiftData.activeShift;
  const activeShift = shiftData?.activeShift;

  const expectedCash = activeShift ? Number(activeShift.runningMetrics?.currentExpectedCash || 0) : 0;
  const actualCount = Number(closingCash || 0);
  const variance = actualCount - expectedCash;

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                hasActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {hasActive ? 'Register Shift Open' : 'Register Shift Closed'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">POS Shift Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Open cash drawers, track live register volume, and reconcile end-of-shift variances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sales/pos"
            className="inline-flex items-center gap-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Open POS Terminal</span>
          </Link>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Reconciled Summary Card if just closed */}
      {closedSummary && (
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Shift Reconciliation Report</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Closed: {new Date(closedSummary.closedAt).toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-xs text-slate-400 block">Opening Cash</span>
              <span className="text-base font-mono font-bold">PKR {closedSummary.openingCash}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Cash Sales</span>
              <span className="text-base font-mono font-bold text-emerald-400">
                +PKR {closedSummary.totalCashSales}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Expected in Drawer</span>
              <span className="text-base font-mono font-bold text-sky-400">
                PKR {closedSummary.expectedCash}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Actual Counted</span>
              <span className="text-base font-mono font-bold">PKR {closedSummary.closingCash}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Drawer Variance:</span>
            <span
              className={`text-sm font-mono font-black ${
                Number(closedSummary.variance) === 0
                  ? 'text-emerald-400'
                  : Number(closedSummary.variance) > 0
                  ? 'text-sky-400'
                  : 'text-rose-400'
              }`}
            >
              {Number(closedSummary.variance) >= 0 ? '+' : ''}PKR {closedSummary.variance}
              {Number(closedSummary.variance) === 0 ? ' (Perfect Match)' : ' (Discrepancy Logged)'}
            </span>
          </div>
        </div>
      )}

      {!hasActive ? (
        /* Form to Open Shift */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-sky-50 text-sky-700 rounded-xl">
              <Unlock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Open Register Shift</h2>
              <p className="text-xs text-slate-500">
                Count the physical cash float in your till and enter the starting amount to unlock the POS.
              </p>
            </div>
          </div>

          <form onSubmit={handleOpenShift} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Starting Cash Float (PKR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  PKR
                </span>
                <input
                  type="number"
                  min="0"
                  required
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-14 pr-4 text-base font-mono font-bold text-slate-900 focus:outline-none focus:border-sky-600"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Standard till opening amount is typically PKR 5,000.
              </span>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="inline-flex items-center gap-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
              <span>Open Shift & Unlock POS</span>
            </button>
          </form>
        </div>
      ) : (
        /* Active Shift Monitor & Close Drawer Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Shift Running Meters */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Active Shift Metrics</h3>
                <span className="text-xs text-slate-500 font-mono">
                  Started: {new Date(activeShift.openedAt).toLocaleTimeString()}
                </span>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                Terminal: {activeShift.terminalCode}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 block mb-1">Opening Float</span>
                <span className="text-lg font-mono font-bold text-slate-900">
                  PKR {activeShift.openingCash}
                </span>
              </div>

              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
                <span className="text-xs text-emerald-700 block mb-1">Cash Inflow</span>
                <span className="text-lg font-mono font-bold text-emerald-800">
                  +PKR {activeShift.runningMetrics?.cashSales || 0}
                </span>
              </div>

              <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-100">
                <span className="text-xs text-sky-700 block mb-1">Card & Digital</span>
                <span className="text-lg font-mono font-bold text-sky-800">
                  PKR{' '}
                  {Number(activeShift.runningMetrics?.cardSales || 0) +
                    Number(activeShift.runningMetrics?.digitalSales || 0)}
                </span>
              </div>

              <div className="bg-slate-900 text-white p-4 rounded-xl">
                <span className="text-xs text-slate-400 block mb-1">Expected Till Cash</span>
                <span className="text-lg font-mono font-bold text-emerald-400">
                  PKR {expectedCash}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <span>Orders Processed This Shift:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {activeShift.runningMetrics?.transactionCount || 0} transactions
              </span>
            </div>
          </div>

          {/* Right Column: Close Shift & Count Form */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-700" />
                <span>Close Shift & Reconcile Cash</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Count all cash notes in drawer and submit final count for variance check.
              </p>
            </div>

            <form onSubmit={handleCloseShift} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Actual Closing Cash Count (PKR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    PKR
                  </span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={closingCash}
                    onChange={(e) => setClosingCash(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-14 pr-4 text-base font-mono font-bold text-slate-900 focus:outline-none focus:border-sky-600"
                  />
                </div>
              </div>

              {/* Live Variance Calculation Alert */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                  variance === 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : variance > 0
                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <span className="font-semibold">Drawer Balance Discrepancy:</span>
                <span className="font-mono font-bold text-sm">
                  {variance >= 0 ? '+' : ''}PKR {variance}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Supervisor Notes / Discrepancy Reason (Optional)
                </label>
                <textarea
                  rows={2}
                  value={supervisorNote}
                  onChange={(e) => setSupervisorNote(e.target.value)}
                  placeholder="Note any petty cash deductions or change shortages..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-sky-600"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>Confirm Count & Lock Shift</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
