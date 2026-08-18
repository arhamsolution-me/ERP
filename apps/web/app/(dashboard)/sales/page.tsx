'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, TrendingUp, Users, CreditCard, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SalesDashboardPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/sales/customers');
        const data = await res.json();
        if (data.success) {
          setCustomers(data.customers || []);
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
    return <div className="p-8 text-center text-slate-500 font-medium">Loading sales metrics...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full inline-block mb-2">
            Module Active
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sales Management
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            "What have we sold?" — High-performance POS checkout & revenue management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sales/pos"
            className="inline-flex items-center gap-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-xs transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Open POS Terminal</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales Today</span>
            <div className="text-2xl font-black text-slate-900 mt-1">PKR 0</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Customers</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{customers.length}</div>
          </div>
          <div className="p-3 bg-sky-50 text-sky-700 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment Methods</span>
            <div className="text-2xl font-black text-slate-900 mt-1">Cash / Card</div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Link
          href="/sales/pos"
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-sky-500 shadow-xs transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
              New Sale / POS Terminal
            </h3>
            <p className="text-xs text-slate-500 font-medium">Fast cashier checkout, barcode lookup & automatic inventory deduction</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-sky-700 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/sales/customers"
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-sky-500 shadow-xs transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
              Customer Directory
            </h3>
            <p className="text-xs text-slate-500 font-medium">Manage retail & wholesale customer accounts and credit limits</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-sky-700 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
