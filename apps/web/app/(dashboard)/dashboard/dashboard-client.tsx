'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Boxes, Clock, Sparkles, Layers, ShieldCheck } from 'lucide-react';

const MODULE_MAP: Record<string, { name: string; category: string; icon: any }> = {
  'sales-management': {
    name: 'Sales Management',
    category: 'Sales & Revenue',
    icon: ShoppingBag,
  },
  'inventory-management': {
    name: 'Inventory Management',
    category: 'Stock & Operations',
    icon: Boxes,
  },
};

export default function DashboardClient() {
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [tenantName, setTenantName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch real DB tenant details & active modules
    async function loadTenantDataFromDB() {
      try {
        const res = await fetch('/api/onboarding');
        if (res.status === 401) {
          // AUTO LOGOUT: User or tenant missing in DB!
          if (typeof window !== 'undefined') {
            localStorage.clear();
            window.location.href = '/sign-in';
          }
          return;
        }
        const data = await res.json();
        if (data.success) {
          if (data.businessName) setTenantName(data.businessName);
          if (data.activeModules && Array.isArray(data.activeModules)) {
            setActiveModules(data.activeModules);
          }
        }
      } catch (e) {
        console.error('Error fetching tenant data from DB:', e);
      } finally {
        setLoading(false);
      }
    }
    loadTenantDataFromDB();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center text-slate-400 font-medium">
        Loading workspace from database...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 font-sans">
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-2 relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full inline-block mb-2">
              Enterprise Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {tenantName || 'Workspace'}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Your active enterprise services are provisioned and isolated for your workspace.
            </p>
          </div>
          <div className="hidden sm:flex p-3.5 bg-sky-50 border border-sky-100 rounded-2xl text-sky-700">
            <Sparkles className="w-7 h-7" />
          </div>
        </div>
      </motion.div>

      {/* Subscribed Active Services Grid with Coming Soon Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-700" />
            Active Subscribed Services ({activeModules.length})
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            Modules Selected During Onboarding
          </span>
        </div>

        {activeModules.length === 0 ? (
          <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-slate-500 text-sm">
            No active services found in database.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {activeModules.map((modId) => {
              const info = MODULE_MAP[modId] || {
                name: modId,
                category: 'Enterprise Service',
                icon: Layers,
              };
              const IconComp = info.icon;
              return (
                <motion.div
                  key={modId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 relative"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-sky-700 text-white rounded-xl shadow-sm">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">
                          {info.name}
                        </h3>
                        <span className="text-xs font-semibold text-slate-400">
                          {info.category}
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full shadow-2xs">
                      <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                      Coming Soon
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Isolated Service Cluster
                    </span>
                    <span className="font-mono text-slate-400">STATUS: PROVISIONING</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
