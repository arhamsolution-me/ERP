'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  RotateCcw,
  Printer,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShoppingBag,
  ArrowLeft,
  X,
} from 'lucide-react';
import Link from 'next/link';

export default function PosTransactionHistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [selectedTx, setSelectedTx] = useState<any>(null);

  // Refund Modal State
  const [refundTx, setRefundTx] = useState<any>(null);
  const [refundSelections, setRefundSelections] = useState<Record<string, number>>({});
  const [refundReason, setRefundReason] = useState('defective');
  const [refundLoading, setRefundLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function loadTransactions() {
    try {
      setLoading(true);
      const url = new URL('/api/sales/transactions', window.location.origin);
      if (paymentMethodFilter) url.searchParams.set('paymentMethod', paymentMethodFilter);
      if (search) url.searchParams.set('search', search);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, [paymentMethodFilter]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    loadTransactions();
  }

  function openRefundModal(tx: any) {
    setRefundTx(tx);
    // Default select 1 qty for all refundable items
    const initial: Record<string, number> = {};
    tx.items.forEach((it: any) => {
      initial[it.variantId] = it.quantity;
    });
    setRefundSelections(initial);
    setFeedbackMsg(null);
  }

  async function handleProcessRefund(e: React.FormEvent) {
    e.preventDefault();
    if (!refundTx) return;
    setRefundLoading(true);
    setFeedbackMsg(null);

    const itemsToRefund = Object.entries(refundSelections)
      .filter(([_, qty]) => qty > 0)
      .map(([variantId, quantity]) => ({ variantId, quantity }));

    if (itemsToRefund.length === 0) {
      setFeedbackMsg({ type: 'error', text: 'Select at least one item quantity to refund' });
      setRefundLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/sales/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: refundTx.id,
          items: itemsToRefund,
          reason: refundReason,
          refundMethod: refundTx.paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process refund');

      setFeedbackMsg({ type: 'success', text: `Refund of PKR ${data.refund?.amount} processed successfully!` });
      setRefundTx(null);
      await loadTransactions();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setRefundLoading(false);
    }
  }

  const filtered = transactions.filter(
    (tx) =>
      tx.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      tx.id.toLowerCase().includes(search.toLowerCase()) ||
      (tx.customer?.name && tx.customer.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/sales/pos"
              className="text-xs font-semibold text-sky-700 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to POS</span>
            </Link>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">POS Transaction History</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Search historical cashier receipts, reprint invoices, and issue supervisor-controlled refunds.
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

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Receipt #, Transaction ID, or Customer name..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-600"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">All Payment Methods</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="jazzcash">JazzCash</option>
            <option value="easypaisa">Easypaisa</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-sky-700" />
            <span>Loading transaction logs...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No POS transactions match your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Receipt / ID</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{tx.receiptNumber}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {tx.customer ? (
                        <div>
                          <span className="font-bold text-slate-900 block">{tx.customer.name}</span>
                          <span className="text-[10px] text-slate-400">{tx.customer.phone || 'No phone'}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Walk-in</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold text-slate-700">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">PKR {tx.total}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          tx.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : tx.status === 'partially_refunded'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {tx.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="inline-flex items-center gap-1 text-slate-700 hover:text-sky-700 font-bold text-xs p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="View Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      {tx.status !== 'refunded' && (
                        <button
                          onClick={() => openRefundModal(tx)}
                          className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-800 font-bold text-xs p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Process Refund"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Refund</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Receipt #{selectedTx.receiptNumber}</h3>
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(selectedTx.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {selectedTx.items.map((it: any) => (
                <div key={it.id} className="flex justify-between text-xs py-1 border-b border-slate-50">
                  <div>
                    <span className="font-bold text-slate-800 block">{it.productName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      PKR {it.unitPrice} × {it.quantity}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">PKR {it.lineTotal}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600 font-medium">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono">PKR {selectedTx.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span className="font-mono">PKR {selectedTx.tax}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Paid ({selectedTx.paymentMethod}):</span>
                <span className="font-mono text-sky-700">PKR {selectedTx.total}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Copy</span>
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process Refund Modal */}
      {refundTx && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5 text-rose-700">
                  <RotateCcw className="w-4 h-4" />
                  <span>Process Refund — {refundTx.receiptNumber}</span>
                </h3>
                <span className="text-xs text-slate-500">
                  Select items and quantities to reverse from sale and restock into inventory.
                </span>
              </div>
              <button
                onClick={() => setRefundTx(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessRefund} className="space-y-4">
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {refundTx.items.map((it: any) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">{it.productName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        PKR {it.unitPrice} each (Sold: {it.quantity})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-semibold">Qty:</span>
                      <input
                        type="number"
                        min="0"
                        max={it.quantity}
                        value={refundSelections[it.variantId] || 0}
                        onChange={(e) =>
                          setRefundSelections({
                            ...refundSelections,
                            [it.variantId]: parseInt(e.target.value || '0', 10),
                          })
                        }
                        className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-center font-mono font-bold"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reason for Refund
                </label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:outline-none"
                >
                  <option value="defective">Defective / Damaged Item</option>
                  <option value="wrong_item">Wrong Item Given</option>
                  <option value="changed_mind">Customer Changed Mind</option>
                  <option value="other">Other / Supervisor Exception</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={refundLoading}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {refundLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  <span>Authorize & Restock Items</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRefundTx(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 px-4 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
