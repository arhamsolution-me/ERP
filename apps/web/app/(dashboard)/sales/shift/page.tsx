'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  ShoppingBag,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function PosShiftPage() {
  const [loading, setLoading] = useState(true);
  const [shiftData, setShiftData] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function fetchShiftStatus() {
    try {
      setLoading(true);
      const res = await fetch('/api/sales/shifts/current');
      const data = await res.json();
      if (data.success) {
        setShiftData(data);
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
        body: JSON.stringify({ openingCash: 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to open shift');

      setStatusMsg({ type: 'success', text: 'Register shift opened successfully.' });
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
          closingCash: 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to close shift');

      setStatusMsg({ type: 'success', text: 'Register shift closed successfully.' });
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
            Manage cashier register sessions and unlock point-of-sale terminals.
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
                Initialize your cashier register session to start processing point-of-sale transactions.
              </p>
            </div>
          </div>

          <form onSubmit={handleOpenShift} className="space-y-4 max-w-lg">
            <button
              type="submit"
              disabled={actionLoading}
              className="inline-flex items-center gap-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
              <span>Open Shift &amp; Unlock POS</span>
            </button>
          </form>
        </div>
      ) : (
        /* Active Shift Status & Simple Close Button */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Register Session Active</h2>
                <p className="text-xs text-slate-500">
                  Terminal is ready and actively processing sales transactions.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg">
              Terminal: {activeShift?.terminalCode || 'POS-01'}
            </span>
          </div>

          <form onSubmit={handleCloseShift} className="pt-2">
            <button
              type="submit"
              disabled={actionLoading}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>Close Register Shift</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
