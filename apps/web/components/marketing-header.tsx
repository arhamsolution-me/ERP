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
  ChevronRight,
  Mail,
  Phone,
  Globe,
  Share2,
  Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeModuleTab, setActiveModuleTab] = useState<string>("production");
  const [activeIndustryTab, setActiveIndustryTab] = useState<string>("textile");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const industryTabs = [
    {
      id: "textile",
      title: "Spinning & Weaving Mills",
      icon: Building2,
      desc: "Raw cotton bale inventory, yarn count tracking, weaving loom shift efficiency, and chemical vat dyeing recipes.",
      features: [
        "Bale Lot Quality Control",
        "Weaving Machine Downtime",
        "Yarn Production Slips",
        "Dyeing Batch Recipes",
        "Shift Allocation",
        "Looms Yield Analytics"
      ],
      link: "/industries#textile"
    },
    {
      id: "apparel",
      title: "Apparel & Garment Units",
      icon: Layers,
      desc: "Cut-to-pack garment tracking, piece-rate worker payroll, trim inventory, and order milestone tracking.",
      features: [
        "Cut-Piece Lot Bundles",
        "Worker Piece-Rate Payroll",
        "Trims & Buttons Stock",
        "Stitching Quality Control",
        "Export Packing Lists",
        "Subcontractor POs"
      ],
      link: "/industries#apparel"
    },
    {
      id: "retail",
      title: "Fashion & Retail Chains",
      icon: Store,
      desc: "Fast barcode POS billing, multi-store stock transfers, cashier shift registers, and loyalty points.",
      features: [
        "1.2s Barcode Scanning",
        "Inter-Store Stock Transfer",
        "Cashier Shift Audit",
        "Customer Loyalty Points",
        "Discounts & Vouchers",
        "Offline Billing Queue"
      ],
      link: "/industries#retail"
    },
    {
      id: "wholesale",
      title: "Wholesale B2B Supply",
      icon: ShoppingCart,
      desc: "Tiered distributor pricing, bulk customer credit limits, proforma invoices, and gate pass dispatches.",
      features: [
        "Tiered Wholesale Rates",
        "Customer Credit Limits",
        "Bulk PO Invoicing",
        "Rep Sales Tracking",
        "Dispatch Gate Passes",
        "Accounts Receivable"
      ],
      link: "/industries#wholesale"
    },
    {
      id: "logistics",
      title: "Warehousing & Logistics Hubs",
      icon: Package,
      desc: "Multi-warehouse WMS, barcode SKU bin locations, automated reorder alerts, and stock valuation audits.",
      features: [
        "Multi-Bin Stock Locations",
        "Automated Reorder Alerts",
        "Stock Audit Adjustments",
        "Batch Expiry Dates",
        "Barcode Scanning WMS",
        "Valuation (FIFO/AVG)"
      ],
      link: "/industries#logistics"
    },
    {
      id: "finance_ent",
      title: "Enterprise Group Holdings",
      icon: Receipt,
      desc: "Consolidated multi-company general ledger, inter-company billing, bank reconciliation, and P&L.",
      features: [
        "Multi-Company Ledger",
        "Inter-Company Invoicing",
        "Bank Direct Sync",
        "Consolidated P&L",
        "Balance Sheet Engine",
        "Tax Audit Trail"
      ],
      link: "/industries#finance"
    }
  ];

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
      className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 ease-out ${
        isScrolled 
          ? "bg-[#0284c7] backdrop-blur-md border-b border-sky-500/80 text-white shadow-xl shadow-sky-950/20" 
          : "bg-transparent border-b border-transparent text-slate-900"
      }`}
      onMouseLeave={() => setActiveMenu(null)}
    >
      {/* TOP MINI INFO BAR - Smooth GPU-accelerated CSS transition with zero DOM lag */}
      <div 
        className={`w-full bg-sky-600 text-white border-b border-sky-700/60 overflow-hidden transition-all duration-300 ease-out ${
          isScrolled 
            ? "max-h-0 opacity-0 py-0 border-none pointer-events-none" 
            : "max-h-16 opacity-100 py-2.5 px-4 sm:px-6"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between text-xs sm:text-sm font-bold">
          
          {/* Left: Social Media Logos (Facebook, Instagram, GitHub, LinkedIn, X, YouTube) */}
          <div className="flex items-center gap-4 text-white">
            {/* Facebook */}
            <a href="#" className="hover:text-sky-200 transition-transform hover:scale-110" aria-label="Facebook">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" className="hover:text-sky-200 transition-transform hover:scale-110" aria-label="Instagram">
              <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            {/* GitHub */}
            <a href="#" className="hover:text-sky-200 transition-transform hover:scale-110" aria-label="GitHub">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="#" className="hover:text-sky-200 transition-transform hover:scale-110" aria-label="LinkedIn">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.762-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            {/* X / Twitter */}
            <a href="#" className="hover:text-sky-200 transition-transform hover:scale-110" aria-label="X (Twitter)">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            {/* YouTube */}
            <a href="#" className="hover:text-sky-200 transition-transform hover:scale-110" aria-label="YouTube">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>

          {/* Right: Contact Email & Phone */}
          <div className="flex items-center gap-6">
            <a href="mailto:devnexes.support@gmail.com" className="flex items-center gap-2 hover:text-sky-200 transition-colors">
              <Mail className="w-4 h-4 text-sky-200" />
              <span>devnexes.support@gmail.com</span>
            </a>

            <a href="tel:+923030111550" className="flex items-center gap-2 hover:text-sky-200 transition-colors">
              <Phone className="w-4 h-4 text-sky-200" />
              <span>+92 3030111550</span>
            </a>
          </div>

        </div>
      </div>

      {/* STICKY MAIN HEADER */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 sm:h-22 items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setActiveMenu(null)}>
            <div className={`w-10.5 h-10.5 rounded-xl flex items-center justify-center shadow-md transition-all ${
              isScrolled ? "bg-white text-sky-600 font-bold" : "bg-sky-600 text-white shadow-sky-600/25 group-hover:bg-sky-700"
            }`}>
              <Box className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-black tracking-tight transition-colors ${
                isScrolled ? "text-white" : "text-slate-900"
              }`}>
                Nex<span className={isScrolled ? "text-sky-200" : "text-sky-600"}>ERP</span>
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
                  ? isScrolled ? "bg-sky-700/60 text-white" : "bg-sky-50 text-sky-600"
                  : isScrolled ? "text-white/95 hover:bg-sky-700/40 hover:text-white" : "text-slate-800 hover:text-sky-600 hover:bg-slate-100"
              }`}
            >
              <span>Modules &amp; Capabilities</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                activeMenu === "modules" ? "rotate-180" : ""
              } ${isScrolled ? "text-sky-200" : "text-slate-400"}`} />
            </button>

            {/* Nav Item 2: Industries */}
            <button
              onClick={() => toggleMenu("industries")}
              onMouseEnter={() => setActiveMenu("industries")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[15px] font-bold rounded-lg transition-all ${
                activeMenu === "industries"
                  ? isScrolled ? "bg-sky-700/60 text-white" : "bg-sky-50 text-sky-600"
                  : isScrolled ? "text-white/95 hover:bg-sky-700/40 hover:text-white" : "text-slate-800 hover:text-sky-600 hover:bg-slate-100"
              }`}
            >
              <span>Industries &amp; Solutions</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                activeMenu === "industries" ? "rotate-180" : ""
              } ${isScrolled ? "text-sky-200" : "text-slate-400"}`} />
            </button>

            {/* Nav Item 3: Pricing */}
            <Link 
              href="/pricing" 
              onClick={() => setActiveMenu(null)}
              className={`px-4 py-2.5 text-[15px] font-bold rounded-lg transition-all ${
                isScrolled ? "text-white/95 hover:bg-sky-700/40 hover:text-white" : "text-slate-800 hover:text-sky-600 hover:bg-slate-100"
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
                  ? isScrolled ? "bg-sky-700/60 text-white" : "bg-sky-50 text-sky-600"
                  : isScrolled ? "text-white/95 hover:bg-sky-700/40 hover:text-white" : "text-slate-800 hover:text-sky-600 hover:bg-slate-100"
              }`}
            >
              <span>Platform &amp; Governance</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                activeMenu === "platform" ? "rotate-180" : ""
              } ${isScrolled ? "text-sky-200" : "text-slate-400"}`} />
            </button>

          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            <Link href="/sign-in" onClick={() => setActiveMenu(null)}>
              <Button variant="ghost" className={`text-base font-bold h-11 px-4 rounded-lg transition-colors ${
                isScrolled ? "text-white hover:bg-sky-700/50" : "text-slate-700 hover:text-slate-900"
              }`}>
                Sign In
              </Button>
            </Link>
            <Link href="/contact" onClick={() => setActiveMenu(null)}>
              <Button className={`text-base font-bold h-11 px-5 rounded-lg transition-all ${
                isScrolled 
                  ? "bg-white text-sky-700 hover:bg-sky-50 shadow-md font-extrabold" 
                  : "bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/25"
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
            className={`absolute top-full inset-x-0 bg-white text-slate-900 border-t-4 border-sky-600 border-b border-slate-200 shadow-2xl shadow-black/20 overflow-hidden z-50 pointer-events-auto`}
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-7">
              
              {/* SUBHEADER MENU 1: MODULES & CAPABILITIES (SIDEBAR TABBED LAYOUT MATCHED TO SCREENSHOT) */}
              {activeMenu === "modules" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* LEFT SIDEBAR NAVIGATION */}
                  <div className="lg:col-span-4 space-y-1">
                    <span className="text-[12px] font-extrabold tracking-wider text-slate-400 uppercase mb-3 block px-3.5">
                      OUR MODULES
                    </span>
                    {moduleTabs.map((tab) => {
                      const IconComp = tab.icon;
                      const isActive = activeModuleTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onMouseEnter={() => setActiveModuleTab(tab.id)}
                          onClick={() => setActiveModuleTab(tab.id)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                            isActive
                              ? "bg-sky-600 text-white shadow-md shadow-sky-600/25"
                              : "text-slate-800 hover:text-sky-600 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <IconComp className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-white" : "text-sky-600"}`} />
                            <span>{tab.title}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "text-white" : "text-slate-400"}`} />
                        </button>
                      );
                    })}
                  </div>

                  {/* RIGHT CONTENT DISPLAY PANEL */}
                  <div className="lg:col-span-8 pl-5 space-y-5">
                    {(() => {
                      const currentTab = moduleTabs.find(t => t.id === activeModuleTab) || moduleTabs[0];
                      const IconMain = currentTab.icon;
                      return (
                        <div className="space-y-6">
                          {/* Module Header & Description */}
                          <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/25 shrink-0">
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
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>

                          {/* Bottom CTA Action Link */}
                          <Link 
                            href={currentTab.link}
                            onClick={() => setActiveMenu(null)}
                            className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700 group transition-colors"
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

              {/* SUBHEADER MENU 2: INDUSTRIES & SOLUTIONS (SIDEBAR TABBED LAYOUT) */}
              {activeMenu === "industries" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* LEFT SIDEBAR NAVIGATION */}
                  <div className="lg:col-span-4 space-y-1">
                    <span className="text-[12px] font-extrabold tracking-wider text-slate-400 uppercase mb-3 block px-3.5">
                      OUR INDUSTRIES
                    </span>
                    {industryTabs.map((tab) => {
                      const IconComp = tab.icon;
                      const isActive = activeIndustryTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onMouseEnter={() => setActiveIndustryTab(tab.id)}
                          onClick={() => setActiveIndustryTab(tab.id)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                            isActive
                              ? "bg-sky-600 text-white shadow-md shadow-sky-600/25"
                              : "text-slate-800 hover:text-sky-600 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <IconComp className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-white" : "text-sky-600"}`} />
                            <span>{tab.title}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "text-white" : "text-slate-400"}`} />
                        </button>
                      );
                    })}
                  </div>

                  {/* RIGHT CONTENT DISPLAY PANEL */}
                  <div className="lg:col-span-8 pl-5 space-y-5">
                    {(() => {
                      const currentTab = industryTabs.find(t => t.id === activeIndustryTab) || industryTabs[0];
                      const IconMain = currentTab.icon;
                      return (
                        <div className="space-y-6">
                          {/* Industry Header & Description */}
                          <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/25 shrink-0">
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
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>

                          {/* Bottom CTA Action Link */}
                          <Link 
                            href={currentTab.link}
                            onClick={() => setActiveMenu(null)}
                            className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700 group transition-colors"
                          >
                            <span>View all {currentTab.title} solutions</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      );
                    })()}
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
