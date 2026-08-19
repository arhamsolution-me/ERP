'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  Plus,
  CheckCircle2,
  Truck,
  FileText,
  AlertCircle,
  Loader2,
  ArrowRight,
  Filter,
} from 'lucide-react';
import Link from 'next/link';

export default function WholesaleOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function loadOrders() {
    try {
      setLoading(true);
      const url = new URL('/api/sales/wholesale-orders', window.location.origin);
      if (statusFilter !== 'all') url.searchParams.set('status', statusFilter);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  async function handleConfirm(orderId: string) {
    try {
      setActionLoadingId(orderId);
      setMsg(null);
      const res = await fetch(`/api/sales/wholesale-orders/${orderId}/confirm`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to confirm order');

      setMsg({ type: 'success', text: 'Order confirmed and stock reserved successfully.' });
      await loadOrders();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleFulfill(orderId: string) {
    try {
      setActionLoadingId(orderId);
      setMsg(null);
      const res = await fetch(`/api/sales/wholesale-orders/${orderId}/fulfill`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fulfill order');

      setMsg({ type: 'success', text: 'Order fulfilled and stock dispatched.' });
      await loadOrders();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleGenerateInvoice(orderId: string) {
    try {
      setActionLoadingId(orderId);
      setMsg(null);
      const res = await fetch(`/api/sales/wholesale-orders/${orderId}/generate-invoice`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate invoice');

      setMsg({ type: 'success', text: `Invoice #${data.invoice?.invoiceNumber} generated successfully.` });
      await loadOrders();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoadingId(null);
    }
  }

  const filtered = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
            B2B Commercial Sales
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Wholesale Orders</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track wholesale contracts: Draft &rarr; Confirmed (Reserved) &rarr; Fulfilled (Dispatched) &rarr; Invoiced.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sales/wholesale/new"
            className="inline-flex items-center gap-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Wholesale Order</span>
          </Link>
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 border ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto w-full md:w-auto">
          {['all', 'draft', 'confirmed', 'fulfilled', 'invoiced'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order or customer..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-10 pr-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-600"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-sky-700" />
            <span>Loading wholesale orders...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-14 text-center text-slate-400 text-sm space-y-3">
            <Boxes className="w-8 h-8 mx-auto text-slate-300" />
            <p>No wholesale orders found in &apos;{statusFilter}&apos; stage.</p>
            <Link
              href="/sales/wholesale/new"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg hover:bg-sky-100"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Wholesale Order</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer Account</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((ord) => {
                  const isBusy = actionLoadingId === ord.id;
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-bold text-slate-900 block">{ord.customer?.name || 'Wholesale Client'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Credit Limit: PKR {Number(ord.customer?.creditLimit || 0).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        PKR {Number(ord.totalAmount).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            ord.status === 'invoiced'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : ord.status === 'fulfilled'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : ord.status === 'confirmed'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        {/* Status Transition Lifecycle Buttons */}
                        {ord.status === 'draft' && (
                          <button
                            onClick={() => handleConfirm(ord.id)}
                            disabled={isBusy}
                            className="bg-sky-700 hover:bg-sky-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                            <span>Confirm & Reserve</span>
                          </button>
                        )}

                        {ord.status === 'confirmed' && (
                          <button
                            onClick={() => handleFulfill(ord.id)}
                            disabled={isBusy}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Truck className="w-3 h-3" />}
                            <span>Fulfill Dispatch</span>
                          </button>
                        )}

                        {ord.status === 'fulfilled' && (
                          <button
                            onClick={() => handleGenerateInvoice(ord.id)}
                            disabled={isBusy}
                            className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                            <span>Generate Invoice</span>
                          </button>
                        )}

                        {ord.status === 'invoiced' && (
                          <span className="text-[11px] font-mono text-purple-700 font-bold bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                            {ord.invoice?.invoiceNumber || 'Invoiced'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
