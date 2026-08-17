"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Box, 
  ChevronDown, 
  Factory, 
  Store, 
  TrendingUp, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Sparkles, 
  ArrowRight,
  Package,
  Receipt,
  Users2,
  Building2,
  FileCheck,
  Zap,
  Lock,
  ShoppingCart,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  return (
    <header 
      className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? "bg-blue-600 border-b border-blue-700 text-white shadow-xl shadow-blue-900/20" 
          : "bg-transparent border-b border-transparent text-slate-900"
      }`}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 sm:h-22 items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setActiveMenu(null)}>
            <div className={`w-10.5 h-10.5 rounded-xl flex items-center justify-center shadow-md transition-all ${
              isScrolled ? "bg-white text-blue-600" : "bg-blue-600 text-white shadow-blue-600/25 group-hover:bg-blue-700"
            }`}>
              <Box className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-extrabold tracking-tight font-sans transition-colors ${
                isScrolled ? "text-white" : "text-slate-900"
              }`}>
                Nex<span className={isScrolled ? "text-blue-200 font-black" : "text-blue-600 font-black"}>ERP</span>
              </span>
            </div>
          </Link>

          {/* Navigation Items with Mega Dropdown triggers */}
          <nav className="hidden lg:flex items-center gap-1.5">
            
            {/* Nav Item 1: Modules & Capabilities */}
            <button
              onClick={() => toggleMenu("modules")}
              onMouseEnter={() => setActiveMenu("modules")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-base font-bold rounded-lg transition-all ${
                activeMenu === "modules"
                  ? isScrolled ? "bg-blue-700 text-white" : "bg-blue-50 text-blue-600"
                  : isScrolled ? "text-blue-50 hover:bg-blue-700/80" : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <span>Modules & Capabilities</span>
              <ChevronDown className={`w-4.5 h-4.5 transition-transform duration-200 ${
                activeMenu === "modules" ? "rotate-180" : ""
              } ${isScrolled ? "text-blue-200" : "text-slate-400"}`} />
            </button>

            {/* Nav Item 2: Industries */}
            <button
              onClick={() => toggleMenu("industries")}
              onMouseEnter={() => setActiveMenu("industries")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-base font-bold rounded-lg transition-all ${
                activeMenu === "industries"
                  ? isScrolled ? "bg-blue-700 text-white" : "bg-blue-50 text-blue-600"
                  : isScrolled ? "text-blue-50 hover:bg-blue-700/80" : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <span>Industries & Solutions</span>
              <ChevronDown className={`w-4.5 h-4.5 transition-transform duration-200 ${
                activeMenu === "industries" ? "rotate-180" : ""
              } ${isScrolled ? "text-blue-200" : "text-slate-400"}`} />
            </button>

            {/* Nav Item 3: Pricing */}
            <Link 
              href="/pricing" 
              onClick={() => setActiveMenu(null)}
              className={`px-4 py-2.5 text-base font-bold rounded-lg transition-all ${
                isScrolled ? "text-blue-50 hover:bg-blue-700/80" : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              Pricing Plans
            </Link>

            {/* Nav Item 4: Platform & Security */}
            <button
              onClick={() => toggleMenu("platform")}
              onMouseEnter={() => setActiveMenu("platform")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-base font-bold rounded-lg transition-all ${
                activeMenu === "platform"
                  ? isScrolled ? "bg-blue-700 text-white" : "bg-blue-50 text-blue-600"
                  : isScrolled ? "text-blue-50 hover:bg-blue-700/80" : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <span>Platform & Governance</span>
              <ChevronDown className={`w-4.5 h-4.5 transition-transform duration-200 ${
                activeMenu === "platform" ? "rotate-180" : ""
              } ${isScrolled ? "text-blue-200" : "text-slate-400"}`} />
            </button>

          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            <Link href="/sign-in" onClick={() => setActiveMenu(null)}>
              <Button variant="ghost" className={`text-base font-bold h-11 px-4 rounded-lg transition-colors ${
                isScrolled ? "text-white hover:bg-blue-700" : "text-slate-700 hover:text-slate-900"
              }`}>
                Sign In
              </Button>
            </Link>
            <Link href="/contact" onClick={() => setActiveMenu(null)}>
              <Button className={`text-base font-bold h-11 px-5 rounded-lg transition-all ${
                isScrolled 
                  ? "bg-white text-blue-700 hover:bg-slate-100 shadow-md font-bold" 
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25"
              }`}>
                Book a Demo
              </Button>
            </Link>
          </div>

        </div>
      </div>

      {/* ANIMATED MEGA SUBHEADER OVERLAY PANEL */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full inset-x-0 bg-white text-slate-900 border-b border-slate-200 overflow-hidden z-50 pointer-events-auto"
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-7">
              
              {/* SUBHEADER MENU 1: MODULES & CAPABILITIES (ALL 8 CORE SYSTEM MODULES) */}
              {activeMenu === "modules" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Module 1: Production MES */}
                  <Link 
                    href="/features#production" 
                    onClick={() => setActiveMenu(null)}
                    className="p-3.5 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <Factory className="w-4.5 h-4.5 text-blue-600" />
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Production & Textile MES</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Raw yarn lot tracking, weaving looms, dyeing recipes, and quality control.</p>
                  </Link>

                  {/* Module 2: Inventory WMS */}
                  <Link 
                    href="/features#warehouse" 
                    onClick={() => setActiveMenu(null)}
                    className="p-3.5 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <Package className="w-4.5 h-4.5 text-blue-600" />
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Inventory & Smart WMS</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Multi-warehouse stock tracking, inter-store transfers, and reorder limits.</p>
                  </Link>

                  {/* Module 3: Retail POS */}
                  <Link 
                    href="/features#pos" 
                    onClick={() => setActiveMenu(null)}
                    className="p-3.5 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <Store className="w-4.5 h-4.5 text-blue-600" />
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Retail POS Terminals</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">1.2s fast barcode checkout, offline register queue, and receipt printing.</p>
                  </Link>

                  {/* Module 4: Sales B2B */}
                  <Link 
                    href="/features#sales" 
                    onClick={() => setActiveMenu(null)}
                    className="p-3.5 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <ShoppingCart className="w-4.5 h-4.5 text-blue-600" />
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Sales & B2B Wholesale</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Bulk B2B orders, tiered distributor pricing, and customer credit limits.</p>
                  </Link>

                  {/* Module 5: Finance GL */}
                  <Link 
                    href="/features#finance" 
                    onClick={() => setActiveMenu(null)}
                    className="p-3.5 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <Receipt className="w-4.5 h-4.5 text-blue-600" />
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Finance & General Ledger</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Double-entry accounting, customer invoicing, bank reconciliation, and P&L.</p>
                  </Link>

                  {/* Module 6: Procurement PO */}
                  <Link 
                    href="/features#procurement" 
                    onClick={() => setActiveMenu(null)}
                    className="p-3.5 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <Truck className="w-4.5 h-4.5 text-blue-600" />
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Procurement & Purchase PO</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Purchase orders PO, GRN physical verification, and AP vendor aging.</p>
                  </Link>

                  {/* Module 7: HR & Payroll */}
                  <Link 
                    href="/features#hr" 
                    onClick={() => setActiveMenu(null)}
                    className="p-3.5 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <Users2 className="w-4.5 h-4.5 text-blue-600" />
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">HR & Worker Payroll</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Staff attendance, piece-rate worker payroll slips, and loan tracking.</p>
                  </Link>

                  {/* Module 8: Platform Governance */}
                  <Link 
                    href="/features#security" 
                    onClick={() => setActiveMenu(null)}
                    className="p-3.5 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Platform & Governance</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Multi-Tenant Row-Level Security RLS, enterprise RBAC, and audit logs.</p>
                  </Link>

                </div>
              )}

              {/* SUBHEADER MENU 2: INDUSTRIES & SOLUTIONS */}
              {activeMenu === "industries" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  
                  <div className="p-3.5 rounded-xl hover:bg-slate-50 transition-all group">
                    <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-slate-900 group-hover:text-blue-600" />
                      <span>Spinning & Weaving Mills</span>
                    </h5>
                    <p className="text-xs text-slate-500 leading-relaxed">Cotton bale inventory, yarn counts, and loom shift tracking.</p>
                  </div>

                  <div className="p-3.5 rounded-xl hover:bg-slate-50 transition-all group">
                    <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                      <Store className="w-4 h-4 text-slate-900 group-hover:text-blue-600" />
                      <span>Fashion & Retail Chains</span>
                    </h5>
                    <p className="text-xs text-slate-500 leading-relaxed">Multi-outlet POS billing, barcode tags, and central warehouse sync.</p>
                  </div>

                  <div className="p-3.5 rounded-xl hover:bg-slate-50 transition-all group">
                    <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-slate-900 group-hover:text-blue-600" />
                      <span>Wholesale B2B Supply</span>
                    </h5>
                    <p className="text-xs text-slate-500 leading-relaxed">Tiered customer pricing, credit limits, and bulk order dispatch.</p>
                  </div>

                  <div className="p-3.5 rounded-xl hover:bg-slate-50 transition-all group">
                    <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                      <Users2 className="w-4 h-4 text-slate-900 group-hover:text-blue-600" />
                      <span>Apparel Stitching Units</span>
                    </h5>
                    <p className="text-xs text-slate-500 leading-relaxed">Cut-piece tracking, worker piece-rate payroll, and trim inventory.</p>
                  </div>

                </div>
              )}

              {/* SUBHEADER MENU 3: PLATFORM & GOVERNANCE */}
              {activeMenu === "platform" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  
                  <div className="p-3.5 rounded-xl hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-1">
                      <ShieldCheck className="w-4 h-4 text-slate-900" />
                      <span>Multi-Tenant Data Isolation</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Database row-level security ensuring strict data isolation for every client.</p>
                  </div>

                  <div className="p-3.5 rounded-xl hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-1">
                      <Lock className="w-4 h-4 text-slate-900" />
                      <span>User Roles & Permissions</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Role-based access controls for cashiers, managers, and accountants.</p>
                  </div>

                  <div className="p-3.5 rounded-xl hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-1">
                      <Zap className="w-4 h-4 text-slate-900" />
                      <span>Offline POS Operation</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Local offline sales queue that automatically syncs when internet resumes.</p>
                  </div>

                  <div className="p-3.5 rounded-xl hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-1">
                      <FileCheck className="w-4 h-4 text-slate-900" />
                      <span>Audit Logs & History</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Full system activity trails for all financial entries and stock movements.</p>
                  </div>

                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
