'use client';

import React, { useState, useEffect } from 'react';
import { History, Search, RefreshCw } from 'lucide-react';

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  async function loadMovements() {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory/movements');
      const data = await res.json();
      if (data.success) {
        setMovements(data.movements || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMovements();
  }, []);

  const filtered = filterType === 'ALL' ? movements : movements.filter((m) => m.movementType.toLowerCase() === filterType.toLowerCase());

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-50 text-sky-700 rounded-xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Stock Movement Ledger</h1>
            <p className="text-sm text-slate-500 font-medium">Immutable audit ledger tracking every stock-affecting event</p>
          </div>
        </div>
        <button
          onClick={loadMovements}
          className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {['ALL', 'inbound', 'outbound', 'sale', 'return'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === t ? 'bg-sky-700 text-white shadow-2xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Movements Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading movement ledger...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No movement records found for filter "{filterType}".</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Movement Type</th>
                  <th className="py-3.5 px-4">Reference</th>
                  <th className="py-3.5 px-4 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 text-slate-500 text-xs">{new Date(m.date).toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{m.productName}</td>
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-600">{m.sku}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        m.movementType === 'inbound' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        m.movementType === 'outbound' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        m.movementType === 'sale' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {m.movementType.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs font-mono">{m.referenceType}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
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
