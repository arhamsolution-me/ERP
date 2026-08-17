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
  Lock
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
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200/80" 
          : "bg-transparent border-b border-transparent"
      }`}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 sm:h-22 items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setActiveMenu(null)}>
            <div className="w-10.5 h-10.5 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/25 group-hover:bg-blue-700 transition-all">
              <Box className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
                Nex<span className="text-blue-600 font-black">ERP</span>
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
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <span>Modules & Capabilities</span>
              <ChevronDown className={`w-4.5 h-4.5 transition-transform duration-200 ${activeMenu === "modules" ? "rotate-180 text-blue-600" : "text-slate-400"}`} />
            </button>

            {/* Nav Item 2: Industries */}
            <button
              onClick={() => toggleMenu("industries")}
              onMouseEnter={() => setActiveMenu("industries")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-base font-bold rounded-lg transition-all ${
                activeMenu === "industries"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <span>Industries & Solutions</span>
              <ChevronDown className={`w-4.5 h-4.5 transition-transform duration-200 ${activeMenu === "industries" ? "rotate-180 text-blue-600" : "text-slate-400"}`} />
            </button>

            {/* Nav Item 3: Pricing */}
            <Link 
              href="/pricing" 
              onClick={() => setActiveMenu(null)}
              className="px-4 py-2.5 text-base font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg transition-all"
            >
              Pricing Plans
            </Link>

            {/* Nav Item 4: Platform & Security */}
            <button
              onClick={() => toggleMenu("platform")}
              onMouseEnter={() => setActiveMenu("platform")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-base font-bold rounded-lg transition-all ${
                activeMenu === "platform"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <span>Platform & Governance</span>
              <ChevronDown className={`w-4.5 h-4.5 transition-transform duration-200 ${activeMenu === "platform" ? "rotate-180 text-blue-600" : "text-slate-400"}`} />
            </button>

          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            <Link href="/sign-in" onClick={() => setActiveMenu(null)}>
              <Button variant="ghost" className="text-base font-bold text-slate-700 hover:text-slate-900 h-11 px-4 rounded-lg">
                Sign In
              </Button>
            </Link>
            <Link href="/contact" onClick={() => setActiveMenu(null)}>
              <Button className="text-base font-bold bg-blue-600 hover:bg-blue-700 text-white h-11 px-5 rounded-lg shadow-md shadow-blue-600/25">
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
            className="absolute top-full inset-x-0 bg-white border-b border-slate-200 overflow-hidden z-50 pointer-events-auto"
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-7">
              
              {/* SUBHEADER MENU 1: MODULES & CAPABILITIES */}
              {activeMenu === "modules" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  
                  <Link 
                    href="/features#production" 
                    onClick={() => setActiveMenu(null)}
                    className="p-3.5 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <Factory className="w-4.5 h-4.5 text-slate-900 group-hover:text-blue-600 transition-colors" />
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Textile Mill MES</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Raw yarn lot tracking, weaving looms, dyeing recipes, and quality control.</p>
                  </Link>

                  <Link 
                    href="/features#pos" 
                    onClick={() => setActiveMenu(null)}
                    className="p-3.5 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <Store className="w-4.5 h-4.5 text-slate-900 group-hover:text-blue-600 transition-colors" />
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Retail POS Terminals</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Fast barcode scanning, offline register queue, and receipt printing.</p>
                  </Link>

                  <Link 
                    href="/features#warehouse" 
                    onClick={() => setActiveMenu(null)}
                    className="p-3.5 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <Package className="w-4.5 h-4.5 text-slate-900 group-hover:text-blue-600 transition-colors" />
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Inventory & WMS</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Multi-warehouse stock tracking, inter-store transfers, and reorder limits.</p>
                  </Link>

                  <Link 
                    href="/features#finance" 
                    onClick={() => setActiveMenu(null)}
                    className="p-3.5 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <Receipt className="w-4.5 h-4.5 text-slate-900 group-hover:text-blue-600 transition-colors" />
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Finance & General Ledger</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Double-entry accounting, customer invoicing, bank reconciliation, and P&L.</p>
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
