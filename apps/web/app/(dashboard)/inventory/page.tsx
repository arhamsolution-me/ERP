'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ArrowUpRight, ArrowDownLeft, AlertTriangle, Layers, Plus, History } from 'lucide-react';
import Link from 'next/link';

export default function InventoryDashboardPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, movRes] = await Promise.all([
          fetch('/api/inventory/products'),
          fetch('/api/inventory/movements'),
        ]);
        const prodData = await prodRes.json();
        const movData = await movRes.json();

        if (prodData.success) setProducts(prodData.products || []);
        if (movData.success) setMovements(movData.movements || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalStockQty = products.reduce((sum, p) => sum + (p.totalQuantity || 0), 0);
  const lowStockItems = products.filter((p) => (p.totalQuantity || 0) < 5);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading inventory metrics...</div>;
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
            Inventory Management
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            "What stock does the business currently have?" — Real-time ledger & catalog
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/inventory/products"
            className="inline-flex items-center gap-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Products</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{products.length}</div>
          </div>
          <div className="p-3 bg-sky-50 text-sky-700 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Stock Quantity</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalStockQty}</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Warning</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{lowStockItems.length}</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Navigation Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/inventory/products" className="p-4 bg-white border border-slate-200 rounded-xl hover:border-sky-500 transition-all font-bold text-slate-800 text-sm flex items-center justify-between shadow-2xs">
          <span>Products Catalog</span>
          <Package className="w-4 h-4 text-sky-700" />
        </Link>
        <Link href="/inventory/stock-in" className="p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 transition-all font-bold text-slate-800 text-sm flex items-center justify-between shadow-2xs">
          <span>Stock In</span>
          <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
        </Link>
        <Link href="/inventory/stock-out" className="p-4 bg-white border border-slate-200 rounded-xl hover:border-rose-500 transition-all font-bold text-slate-800 text-sm flex items-center justify-between shadow-2xs">
          <span>Stock Out</span>
          <ArrowUpRight className="w-4 h-4 text-rose-600" />
        </Link>
        <Link href="/inventory/movements" className="p-4 bg-white border border-slate-200 rounded-xl hover:border-sky-500 transition-all font-bold text-slate-800 text-sm flex items-center justify-between shadow-2xs">
          <span>Movement Ledger</span>
          <History className="w-4 h-4 text-sky-700" />
        </Link>
      </div>

      {/* Recent Movements Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-4 h-4 text-sky-700" />
            Recent Stock Movements
          </h2>
          <Link href="/inventory/movements" className="text-xs font-bold text-sky-700 hover:underline">
            View Ledger &rarr;
          </Link>
        </div>

        {movements.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">No stock movements recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Product</th>
                  <th className="py-3 px-2">Type</th>
                  <th className="py-3 px-2 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {movements.slice(0, 5).map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-3 px-2 text-slate-500 text-xs">
                      {new Date(m.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 font-bold text-slate-900">{m.productName}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        m.movementType === 'inbound' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        m.movementType === 'outbound' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}>
                        {m.movementType.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-slate-900">
                      {m.movementType === 'outbound' || m.movementType === 'sale' ? `-${m.quantity}` : `+${m.quantity}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
