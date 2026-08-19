'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  TrendingUp,
  Users,
  CreditCard,
  Plus,
  ArrowRight,
  Clock,
  RotateCcw,
  FileText,
  Boxes,
  Loader2,
  Lock,
  Unlock,
} from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function SalesDashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [rankingMode, setRankingMode] = useState<'revenue' | 'quantity'>('revenue');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/sales/dashboard');
        const data = await res.json();
        if (data.success) {
          setDashboardData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-slate-500 font-medium">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-sky-700" />
        <span>Loading realtime sales analytics...</span>
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {
    todayRevenue: 0,
    growthPercent: 0,
    totalOrdersCount: 0,
    avgTicketValue: 0,
    totalCustomers: 0,
    hasActiveShift: false,
  };

  const revenueTrend = dashboardData?.revenueTrend || [];
  const paymentBreakdown = dashboardData?.paymentBreakdown || [];
  const topSelling = dashboardData?.topSelling || [];

  const sortedTopProducts = [...topSelling].sort((a, b) =>
    rankingMode === 'revenue' ? b.revenue - a.revenue : b.quantity - a.quantity
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full inline-block">
              Sales Management Active
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                metrics.hasActiveShift
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {metrics.hasActiveShift ? 'Till Open' : 'Till Closed'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sales & POS Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Realtime revenue streams, shift balances, and wholesale order lifecycles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/sales/shift"
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all"
          >
            {metrics.hasActiveShift ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-amber-600" />}
            <span>{metrics.hasActiveShift ? 'Manage Shift' : 'Open Shift'}</span>
          </Link>

          <Link
            href="/sales/pos"
            className="inline-flex items-center gap-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all transform hover:-translate-y-0.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Launch POS Terminal</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Today&apos;s Revenue</span>
            <div className="p-2 bg-sky-50 text-sky-700 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 font-mono">
              PKR {metrics.todayRevenue.toLocaleString()}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <span
                className={`text-[11px] font-bold ${
                  metrics.growthPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {metrics.growthPercent >= 0 ? '+' : ''}
                {metrics.growthPercent}% vs yesterday
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Orders Processed</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {metrics.totalOrdersCount}
            </span>
            <span className="text-[11px] font-medium text-slate-400 block mt-1">
              Avg Ticket: PKR {metrics.avgTicketValue.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Customers CRM</span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {metrics.totalCustomers}
            </span>
            <Link
              href="/sales/customers"
              className="text-[11px] font-bold text-sky-700 hover:underline flex items-center gap-1 mt-1"
            >
              <span>Manage Accounts &rarr;</span>
            </Link>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Wholesale Pipeline</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs font-bold text-slate-700 block">Orders & Invoicing</span>
            <Link
              href="/sales/wholesale"
              className="text-[11px] font-bold text-sky-700 hover:underline flex items-center gap-1 mt-1"
            >
              <span>View Wholesale Orders &rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 7-Day Revenue Trend (Col 8) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">7-Day Revenue Velocity</h3>
              <p className="text-xs text-slate-400">Daily sales aggregated across all POS registers</p>
            </div>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg">
              PKR Curve
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any) => [`PKR ${Number(value).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#salesRevGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Distribution (Col 4) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Payment Breakdown</h3>
            <p className="text-xs text-slate-400">Revenue split by settlement method</p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
                <Tooltip
                  formatter={(val: any) => [`PKR ${Number(val).toLocaleString()}`, 'Volume']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100 text-xs">
            {paymentBreakdown.map((item: any) => (
              <div key={item.name} className="flex justify-between items-center text-slate-600">
                <span className="font-medium">{item.name}</span>
                <span className="font-mono font-bold text-slate-900">PKR {item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Selling Products & Quick Navigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Top Selling Table (Col 8) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Top-Selling Products</h3>
              <p className="text-xs text-slate-400">Best performing inventory by customer demand</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
              <button
                onClick={() => setRankingMode('revenue')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  rankingMode === 'revenue' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                By Revenue
              </button>
              <button
                onClick={() => setRankingMode('quantity')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  rankingMode === 'quantity' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                By Qty
              </button>
            </div>
          </div>

          {sortedTopProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No sales transactions recorded yet. Complete a checkout in POS to see live rankings.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Product Name / SKU</th>
                    <th className="py-2.5 px-3 text-right">Units Sold</th>
                    <th className="py-2.5 px-3 text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sortedTopProducts.map((prod, idx) => (
                    <tr key={prod.sku} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono font-bold text-slate-400">#{idx + 1}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{prod.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{prod.sku}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">
                        {prod.quantity} units
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-sky-700">
                        PKR {prod.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Module Shortcuts (Col 4) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Quick Actions & Logs
          </h3>

          <Link
            href="/sales/pos"
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200/80 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-700 text-white rounded-lg">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-sky-700">
                  POS Terminal
                </span>
                <span className="text-[10px] text-slate-400">Rapid barcode & cashier checkout</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/sales/history"
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200/80 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700 text-white rounded-lg">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-sky-700">
                  Receipts & Refunds
                </span>
                <span className="text-[10px] text-slate-400">Look up sales, reprint, issue refunds</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/sales/shift"
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200/80 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-700 text-white rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-sky-700">
                  Till Shift Register
                </span>
                <span className="text-[10px] text-slate-400">Opening/closing cash reconciliation</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/sales/wholesale"
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200/80 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-700 text-white rounded-lg">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-sky-700">
                  Wholesale Orders
                </span>
                <span className="text-[10px] text-slate-400">Draft, confirm, fulfill & generate invoices</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
