'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Layers,
  Save,
  Loader2,
  PackageX,
} from 'lucide-react';

export interface ModuleItem {
  id: string;
  name: string;
  category: string;
  desc: string;
  icon?: any;
}

// Custom Services List
const ALL_MODULES: ModuleItem[] = [
  {
    id: 'sales-management',
    name: 'Sales Management',
    category: 'Sales',
    desc: 'Quotations, orders, invoices, sales tracking',
  },
  {
    id: 'inventory-management',
    name: 'Inventory Management',
    category: 'Inventory',
    desc: 'Products, stock, warehouses, stock movement',
  },
];

export default function ModuleManagementPage() {
  const [activeModules, setActiveModules] = useState<string[]>([
    'sales-management',
    'inventory-management',
  ]);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleModule = (id: string) => {
    if (activeModules.includes(id)) {
      setActiveModules(activeModules.filter((m) => m !== id));
    } else {
      setActiveModules([...activeModules, id]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeModules }),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving modules:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-600/20">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Service &amp; Module Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage operational services for your workspace.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || ALL_MODULES.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Active Modules
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Workspace Service Configuration updated successfully!
        </div>
      )}

      {/* Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-blue-800 text-xs">
        <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Clean service canvas active. All preset services have been cleared. As new services are created, they will automatically appear here for activation/deactivation.
        </p>
      </div>

      {/* Modules Grid / Empty State */}
      {ALL_MODULES.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl mx-auto flex items-center justify-center">
            <PackageX className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">0 Active Services Configured</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No services are currently loaded. Tell me which service you want to create (e.g. Inventory Management, POS, Production), and we will build it step-by-step!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ALL_MODULES.map((mod) => {
            const Icon = mod.icon || Layers;
            const isActive = activeModules.includes(mod.id);

            return (
              <div
                key={mod.id}
                onClick={() => toggleModule(mod.id)}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${
                  isActive
                    ? 'border-blue-600 bg-white shadow-md shadow-blue-600/5'
                    : 'border-slate-200 bg-slate-50/50 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-xl text-white ${
                          isActive ? 'bg-blue-600 shadow-md shadow-blue-600/20' : 'bg-slate-400'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{mod.name}</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {mod.category}
                        </span>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => {}}
                      className="w-5 h-5 accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{mod.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span
                    className={`font-semibold ${
                      isActive ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  >
                    {isActive ? 'Service Active' : 'Service Disabled'}
                  </span>
                  {isActive && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
