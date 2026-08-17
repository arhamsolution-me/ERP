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
  Truck,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeModuleTab, setActiveModuleTab] = useState<string>("production");

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

  const moduleTabs = [
    {
      id: "production",
      title: "Production & Textile MES",
      icon: Factory,
      desc: "Raw cotton yarn tracking, weaving looms, chemical dyeing recipes, and machine scorecards.",
      features: [
        "Cotton Bale Lot Tracking",
        "Weaving Loom Efficiency",
        "Chemical Vat Dye Recipes",
        "Worker Shift Allocation",
        "Fabric Roll Quality Control",
        "Scrap & Wastage Reports"
      ],
      link: "/features#production"
    },
    {
      id: "inventory",
      title: "Inventory & Smart WMS",
      icon: Package,
      desc: "Multi-warehouse inventory management, inter-store transfers, and automated reorder limits.",
      features: [
        "Multi-Warehouse Control",
        "Inter-Store Stock Transfers",
        "Barcode & SKU Tags",
        "Reorder Limit Alerts",
        "Batch Expiry Tracking",
        "Audit Stock Valuation"
      ],
      link: "/features#warehouse"
    },
    {
      id: "pos",
      title: "Retail POS Terminals",
      icon: Store,
      desc: "Fast barcode billing, offline transaction queue, receipt printing, and cashier registers.",
      features: [
        "1.2s Barcode Scanning",
        "Offline Sales Queue",
        "Cashier Register Shifts",
        "Thermal Receipt Print",
        "Customer Loyalty Points",
        "Discount Voucher Engine"
      ],
      link: "/features#pos"
    },
    {
      id: "sales",
      title: "Sales & B2B Wholesale",
      icon: ShoppingCart,
      desc: "Bulk B2B customer orders, distributor pricing tiers, and credit limit management.",
      features: [
        "Bulk Wholesale Orders",
        "Tiered Distributor Prices",
        "Customer Credit Limits",
        "Proforma Invoicing",
        "Sales Rep Tracking",
        "Dispatch Gate Passes"
      ],
      link: "/features#sales"
    },
    {
      id: "finance",
      title: "Finance & General Ledger",
      icon: Receipt,
      desc: "Double-entry general ledger, customer invoicing, bank reconciliation, and P&L reporting.",
      features: [
        "Automated Double-Entry GL",
        "Customer Tax Invoices",
        "Bank Statement Sync",
        "Profit & Loss (P&L)",
        "Balance Sheet Engine",
        "Tax Audit Compliance"
      ],
      link: "/features#finance"
    },
    {
      id: "procurement",
      title: "Procurement & Purchase PO",
      icon: Truck,
      desc: "Purchase orders PO, goods received note GRN physical verification, and vendor aging.",
      features: [
        "Purchase Orders (PO)",
        "GRN Physical Verification",
        "Vendor Price Quotes",
        "AP Vendor Payable Aging",
        "Return Debit Notes",
        "Supplier Performance"
      ],
      link: "/features#procurement"
    },
    {
      id: "hr",
      title: "HR & Worker Payroll",
      icon: Users2,
      desc: "Staff attendance, piece-rate worker payroll slips, advances, and department management.",
      features: [
        "Staff Attendance Logs",
        "Piece-Rate Worker Slips",
        "Advance Salary Loans",
        "Monthly Payroll Slips",
        "Department Hierarchy",
        "Leave Approval Workflows"
      ],
      link: "/features#hr"
    },
    {
      id: "platform",
      title: "Platform & Governance",
      icon: ShieldCheck,
      desc: "Multi-tenant PostgreSQL row-level security RLS, enterprise RBAC, and audit logs.",
      features: [
        "PostgreSQL Multi-Tenant RLS",
        "Enterprise RBAC Roles",
        "Full Activity Audit Logs",
        "Clerk OAuth & MFA Sync",
        "99.99% SLA Uptime Cloud",
        "REST & GraphQL APIs"
      ],
      link: "/features#security"
    }
  ];

  return (
    <header 
      className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? "bg-[#0a1628] border-b border-blue-950/80 text-white shadow-2xl shadow-black/40" 
          : "bg-transparent border-b border-transparent text-slate-900"
      }`}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 sm:h-22 items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setActiveMenu(null)}>
            <div className={`w-10.5 h-10.5 rounded-xl flex items-center justify-center shadow-md transition-all ${
              isScrolled ? "bg-white text-blue-700 font-bold" : "bg-blue-600 text-white shadow-blue-600/25 group-hover:bg-blue-700"
            }`}>
              <Box className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-black tracking-tight transition-colors ${
                isScrolled ? "text-white" : "text-slate-900"
              }`}>
                Nex<span className={isScrolled ? "text-blue-200" : "text-blue-600"}>ERP</span>
              </span>
            </div>
          </Link>

          {/* Navigation Items with Mega Dropdown triggers */}
          <nav className="hidden lg:flex items-center gap-1.5">
            
            {/* Nav Item 1: Modules & Capabilities */}
            <button
              onClick={() => toggleMenu("modules")}
              onMouseEnter={() => setActiveMenu("modules")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[15px] font-bold rounded-lg transition-all ${
                activeMenu === "modules"
                  ? isScrolled ? "bg-white/15 text-white" : "bg-blue-50 text-blue-600"
                  : isScrolled ? "text-white/85 hover:bg-white/10 hover:text-white" : "text-slate-800 hover:text-blue-600 hover:bg-slate-100"
              }`}
            >
              <span>Modules &amp; Capabilities</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                activeMenu === "modules" ? "rotate-180" : ""
              } ${isScrolled ? "text-blue-300" : "text-slate-400"}`} />
            </button>

            {/* Nav Item 2: Industries */}
            <button
              onClick={() => toggleMenu("industries")}
              onMouseEnter={() => setActiveMenu("industries")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[15px] font-bold rounded-lg transition-all ${
                activeMenu === "industries"
                  ? isScrolled ? "bg-white/15 text-white" : "bg-blue-50 text-blue-600"
                  : isScrolled ? "text-white/85 hover:bg-white/10 hover:text-white" : "text-slate-800 hover:text-blue-600 hover:bg-slate-100"
              }`}
            >
              <span>Industries &amp; Solutions</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                activeMenu === "industries" ? "rotate-180" : ""
              } ${isScrolled ? "text-blue-300" : "text-slate-400"}`} />
            </button>

            {/* Nav Item 3: Pricing */}
            <Link 
              href="/pricing" 
              onClick={() => setActiveMenu(null)}
              className={`px-4 py-2.5 text-[15px] font-bold rounded-lg transition-all ${
                isScrolled ? "text-white/85 hover:bg-white/10 hover:text-white" : "text-slate-800 hover:text-blue-600 hover:bg-slate-100"
              }`}
            >
              Pricing Plans
            </Link>

            {/* Nav Item 4: Platform & Security */}
            <button
              onClick={() => toggleMenu("platform")}
              onMouseEnter={() => setActiveMenu("platform")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[15px] font-bold rounded-lg transition-all ${
                activeMenu === "platform"
                  ? isScrolled ? "bg-white/15 text-white" : "bg-blue-50 text-blue-600"
                  : isScrolled ? "text-white/85 hover:bg-white/10 hover:text-white" : "text-slate-800 hover:text-blue-600 hover:bg-slate-100"
              }`}
            >
              <span>Platform &amp; Governance</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                activeMenu === "platform" ? "rotate-180" : ""
              } ${isScrolled ? "text-blue-300" : "text-slate-400"}`} />
            </button>

          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            <Link href="/sign-in" onClick={() => setActiveMenu(null)}>
              <Button variant="ghost" className={`text-base font-bold h-11 px-4 rounded-lg transition-colors ${
                isScrolled ? "text-white hover:bg-blue-800" : "text-slate-700 hover:text-slate-900"
              }`}>
                Sign In
              </Button>
            </Link>
            <Link href="/contact" onClick={() => setActiveMenu(null)}>
              <Button className={`text-base font-bold h-11 px-5 rounded-lg transition-all ${
                isScrolled 
                  ? "bg-white text-blue-800 hover:bg-slate-100 shadow-md font-extrabold" 
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
            className={`absolute top-full inset-x-0 bg-white text-slate-900 border-t-4 border-blue-600 border-b border-slate-200 shadow-2xl shadow-black/20 overflow-hidden z-50 pointer-events-auto`}
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-7">
              
              {/* SUBHEADER MENU 1: MODULES & CAPABILITIES (SIDEBAR TABBED LAYOUT MATCHED TO SCREENSHOT) */}
              {activeMenu === "modules" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* LEFT SIDEBAR NAVIGATION */}
                  <div className="lg:col-span-4 space-y-1">
                    <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mb-3 block px-3">
                      OUR MODULES & CAPABILITIES
                    </span>
                    {moduleTabs.map((tab) => {
                      const IconComp = tab.icon;
                      const isActive = activeModuleTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onMouseEnter={() => setActiveModuleTab(tab.id)}
                          onClick={() => setActiveModuleTab(tab.id)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                            isActive
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                              : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <IconComp className={`w-4.5 h-4.5 ${isActive ? "text-white" : "text-blue-600"}`} />
                            <span>{tab.title}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? "text-white translate-x-0.5" : "text-slate-400"}`} />
                        </button>
                      );
                    })}
                  </div>

                  {/* VERTICAL DIVIDER & RIGHT CONTENT DISPLAY PANEL */}
                  <div className="lg:col-span-8 border-l border-slate-200/90 pl-6 space-y-6">
                    {(() => {
                      const currentTab = moduleTabs.find(t => t.id === activeModuleTab) || moduleTabs[0];
                      const IconMain = currentTab.icon;
                      return (
                        <div className="space-y-6">
                          {/* Module Header & Description */}
                          <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25 shrink-0">
                              <IconMain className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                                {currentTab.title}
                              </h3>
                              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                                {currentTab.desc}
                              </p>
                            </div>
                          </div>

                          {/* 3-Column Bullet Features Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-4 pb-4 border-t border-b border-slate-100">
                            {currentTab.features.map((feat, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>

                          {/* Bottom CTA Action Link */}
                          <Link 
                            href={currentTab.link}
                            onClick={() => setActiveMenu(null)}
                            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 group transition-colors"
                          >
                            <span>View all {currentTab.title} capabilities</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      );
                    })()}
                  </div>

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
