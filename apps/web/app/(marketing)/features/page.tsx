"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Factory, 
  Store, 
  TrendingUp, 
  Users, 
  Box, 
  Wallet, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Layers, 
  BarChart3,
  Globe2,
  Lock,
  Server,
  Activity,
  ChevronRight,
  Database,
  FileCheck2,
  PieChart
} from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState<string>("production");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const showCases: Record<string, {
    title: string;
    subtitle: string;
    metrics: { label: string; val: string }[];
    bullets: string[];
    bgGradient: string;
  }> = {
    production: {
      title: "Textile & Manufacturing Execution System (MES)",
      subtitle: "Track raw yarn lots, spinning speeds, dyeing recipes, and machine downtime in real-time.",
      metrics: [
        { label: "Wastage Reduction", val: "38%" },
        { label: "OEE Improvement", val: "+24%" },
        { label: "Batch Traceability", val: "100%" }
      ],
      bullets: [
        "Automated Machine Downtime Tracking & Reason Logs",
        "Dyeing Recipe Chemical Composition Management",
        "Quality Control Checkpoint Scorecards with Defect Flagging",
        "Real-Time Batch Stage Progression (Spinning → Weaving → Dyeing → QC)"
      ],
      bgGradient: "from-blue-600 to-indigo-700"
    },
    inventory: {
      title: "Multi-Location Smart Warehouse Management",
      subtitle: "Unify stock across central textile mills, distribution centers, and retail outlets.",
      metrics: [
        { label: "Stock Accuracy", val: "99.9%" },
        { label: "Transfer Time", val: "-60%" },
        { label: "Fulfillment Rate", val: "98.4%" }
      ],
      bullets: [
        "Barcode & QR Code Instant SKU Lookup",
        "Automated Minimum Reorder Point Triggers",
        "Multi-Warehouse Inter-Branch Transfer Requests & Dispute Resolution",
        "Variant Management (Size, Color, Fabric Density, HSN Code)"
      ],
      bgGradient: "from-emerald-600 to-teal-700"
    },
    pos: {
      title: "High-Throughput Offline-Capable POS Terminal",
      subtitle: "Empower retail cashiers with instant checkout, customer loyalty, and local cache sync.",
      metrics: [
        { label: "Avg Transaction Time", val: "1.8s" },
        { label: "Offline Queue Cap", val: "10,000+" },
        { label: "Daily Peak Throughput", val: "50k/hr" }
      ],
      bullets: [
        "Full Offline Capability with Idempotent Re-sync Engine",
        "Support for Cash, Card, JazzCash, EasyPaisa, and Store Credit",
        "Instant Thermal Receipt Printing & Digital Receipt Emailing",
        "Integrated Customer Loyalty Points & Discount Rule Engines"
      ],
      bgGradient: "from-purple-600 to-indigo-700"
    },
    finance: {
      title: "Automated General Ledger & Export Finance",
      subtitle: "Continuous double-entry ledger, automated tax filings, and bank reconciliation.",
      metrics: [
        { label: "Month-End Close", val: "2 Days" },
        { label: "Reconciliation", val: "Auto" },
        { label: "Audit Accuracy", val: "100%" }
      ],
      bullets: [
        "Automated Bank Statement Line Matching Engine",
        "Real-Time P&L, Balance Sheet, and Trial Balance Generation",
        "Export L/C Document Tracking (Invoices, Packing Lists)",
        "Multi-Tenant Tax Compliance & HSN Tax Rate Calculation"
      ],
      bgGradient: "from-amber-600 to-orange-700"
    },
    ai: {
      title: "AI-Driven Demand Forecasting & Business Intelligence",
      subtitle: "Machine learning algorithms that accurately predict seasonal inventory spikes and demand.",
      metrics: [
        { label: "Forecast Variance", val: "< 3.2%" },
        { label: "Dead Stock Avoided", val: "$140k/yr" },
        { label: "Auto Analytics", val: "24/7" }
      ],
      bullets: [
        "Predictive Demand Forecasting by Branch and Product Line",
        "Automated Pricing Strategy & Margin Optimization",
        "Natural Language Querying for Instant Executive Insights",
        "Automated Anomaly Detection in Daily POS and Production Logs"
      ],
      bgGradient: "from-blue-700 to-cyan-600"
    }
  };

  const categories = [
    { id: "all", label: "All Modules" },
    { id: "production", label: "Manufacturing & MES" },
    { id: "inventory", label: "Inventory & Supply Chain" },
    { id: "sales", label: "Retail & POS" },
    { id: "finance", label: "Finance & HR" },
    { id: "ai", label: "AI & Intelligence" },
  ];

  const features = [
    {
      id: "production",
      category: "production",
      title: "Production & Batch Tracking",
      desc: "Complete end-to-end control over yarn spinning, weaving, dyeing recipes, and garment processing.",
      icon: Factory,
      badge: "Textile Ready",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      details: [
        "Batch & Material Lot Tracking",
        "Machine Downtime Analytics",
        "Dyeing Recipe Management",
        "Wastage & Rejection Monitoring"
      ]
    },
    {
      id: "inventory",
      category: "inventory",
      title: "Multi-Warehouse Inventory",
      desc: "Instant multi-location visibility with instant barcode scanning and automated reorder triggers.",
      icon: Box,
      badge: "Real-time Sync",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      details: [
        "Instant Barcode & QR Lookup",
        "Inter-branch Stock Transfers",
        "Automated Reorder Thresholds",
        "Variant & SKU Management"
      ]
    },
    {
      id: "pos",
      category: "sales",
      title: "Offline-First POS Terminal",
      desc: "Lightning fast checkout counters that keep operating smoothly even without active internet connection.",
      icon: Store,
      badge: "High-Speed",
      color: "bg-purple-50 text-purple-700 border-purple-200",
      details: [
        "Offline Order Queueing",
        "Multi-payment Integration",
        "Thermal Receipt Printing",
        "Customer Loyalty Points"
      ]
    },
    {
      id: "finance",
      category: "finance",
      title: "Automated Accounting",
      desc: "Real-time General Ledger, double-entry bookkeeping, and automated tax calculations.",
      icon: Wallet,
      badge: "Bank Grade",
      color: "bg-amber-50 text-amber-700 border-amber-200",
      details: [
        "Bank Reconciliation Engine",
        "P&L & Balance Sheet Reporting",
        "Multi-Currency Transactions",
        "Export LC & Invoice Management"
      ]
    },
    {
      id: "hr",
      category: "finance",
      title: "HR & Biometric Payroll",
      desc: "Manage factory shift workers, biometric attendance logs, overtime, and monthly automated payroll.",
      icon: Users,
      badge: "HRMS Integrated",
      color: "bg-rose-50 text-rose-700 border-rose-200",
      details: [
        "Biometric Device Integration",
        "Piece-Rate & Fixed Payroll",
        "Leave Requests & Approvals",
        "Employee Shift Roster"
      ]
    },
    {
      id: "ai",
      category: "ai",
      title: "AI Demand & Forecasting",
      desc: "Machine-learning models to forecast demand, prevent overstocking, and optimize pricing.",
      icon: TrendingUp,
      badge: "AI Powered",
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
      details: [
        "Predictive Demand Forecasting",
        "Defect Detection Assistance",
        "Smart Inventory Allocation",
        "Automated Executive Insights"
      ]
    }
  ];

  const filteredFeatures = activeCategory === "all" 
    ? features 
    : features.filter(f => f.category === activeCategory);

  const securitySpecs = [
    { title: "Multi-Tenant Isolation", desc: "Strict schema and tenant-level data segregation with zero data leakage across accounts.", icon: Database },
    { title: "Role-Based Access Control", desc: "Granular permission scopes down to individual UI actions, reports, and financial entries.", icon: ShieldCheck },
    { title: "Comprehensive Audit Logging", desc: "Immutable audit trail capturing exact timestamp, user ID, IP address, and before/after JSON states.", icon: FileCheck2 },
    { title: "High Availability Infrastructure", desc: "Containerized deployment architecture built for 99.99% uptime under high concurrent transaction loads.", icon: Server }
  ];

  const comparison = [
    { feature: "Multi-Tenant Architecture", legacy: "❌ Siloed Single Instances", nexerp: "✅ Native Multi-Tenant Schema" },
    { feature: "POS Offline Queueing", legacy: "❌ Terminal Freeze on Outage", nexerp: "✅ Idempotent Auto Re-Sync" },
    { feature: "Textile Batch Traceability", legacy: "❌ Third-Party Plugins Required", nexerp: "✅ Built-in Textile MES Workflows" },
    { feature: "Bank Reconciliation", legacy: "❌ Manual CSV Uploads", nexerp: "✅ Automated Match Engine" },
    { feature: "AI Demand Forecasting", legacy: "❌ Expensive Add-on Modules", nexerp: "✅ Out-of-the-Box Machine Learning" },
    { feature: "Audit Log Trail", legacy: "⚠️ Basic Login Logs Only", nexerp: "✅ Detailed JSON Differential Auditing" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      
      {/* Hero Header Section */}
      <div className="relative pt-28 pb-20 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100/60 border-b border-slate-200/80">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-blue-100/60 via-indigo-50/30 to-transparent blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Enterprise-Grade ERP Suite</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-4xl font-black tracking-tight sm:text-6xl text-slate-900 leading-[1.15]"
            >
              Architected for Precision. <br />
              <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Engineered for Real-Time Operations.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed"
            >
              Replace fragmented legacy systems with a unified cloud platform designed for modern manufacturing, multi-warehouse inventory, high-speed POS, and automated financials.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              <Link 
                href="/contact" 
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }), 
                  "bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-blue-600/25 flex items-center gap-2"
                )}
              >
                Schedule Executive Demo <ChevronRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/pricing" 
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }), 
                  "border-slate-300 text-slate-700 hover:bg-slate-100 h-12 rounded-xl px-8 font-semibold"
                )}
              >
                Explore Deployment Plans
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Interactive Enterprise Showcase Section */}
      <div className="py-20 bg-white border-b border-slate-200/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Live Capability Interactive Tour</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">Explore Core Platform Modules</h3>
          </div>

          {/* Module Switcher Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 max-w-4xl mx-auto">
            {[
              { id: "production", label: "Production (MES)", icon: Factory },
              { id: "inventory", label: "Inventory & Warehouses", icon: Box },
              { id: "pos", label: "Retail & POS", icon: Store },
              { id: "finance", label: "Finance & Accounting", icon: Wallet },
              { id: "ai", label: "AI & Forecasting", icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 border ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Active Showcase Card */}
          <div className="max-w-5xl mx-auto bg-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl overflow-hidden relative border border-slate-800">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-6">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30 px-3 py-1 font-mono text-xs uppercase">
                  Module Deep Dive
                </Badge>
                <h3 className="text-2xl md:text-3xl font-extrabold leading-tight">
                  {showCases[activeTab]?.title}
                </h3>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  {showCases[activeTab]?.subtitle}
                </p>

                <div className="space-y-3 pt-2">
                  {showCases[activeTab]?.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                      <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stat Counters Column */}
              <div className="md:col-span-5 flex flex-col gap-4">
                <div className={`p-6 rounded-2xl bg-gradient-to-br ${showCases[activeTab]?.bgGradient} text-white shadow-xl space-y-6`}>
                  <div className="text-xs font-bold uppercase tracking-wider opacity-80 border-b border-white/20 pb-3">
                    Validated Performance Metrics
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {showCases[activeTab]?.metrics.map((m, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/10 p-3.5 rounded-xl backdrop-blur-md">
                        <span className="text-sm font-medium text-slate-100">{m.label}</span>
                        <span className="text-xl font-black text-white font-mono">{m.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of All Features */}
      <div className="py-24 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">Complete Feature Breakdown</h2>
          <h3 className="text-3xl font-black text-slate-900">Modular Capabilities Engine</h3>
          <p className="text-slate-600">Filter modules to explore specific operational capabilities built for your industry.</p>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                  activeCategory === cat.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredFeatures.map((feat) => (
              <motion.div
                key={feat.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full bg-white border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-xl transition-all duration-300 group rounded-2xl overflow-hidden">
                  <CardContent className="p-8 flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                          <feat.icon className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                        <Badge variant="outline" className={`${feat.color} font-bold text-xs`}>
                          {feat.badge}
                        </Badge>
                      </div>

                      <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {feat.title}
                      </h4>
                      <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        {feat.desc}
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-4 border-t border-slate-100">
                      {feat.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Enterprise Security & Governance Section */}
      <div className="py-20 bg-slate-900 text-white border-t border-b border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30 px-3 py-1 font-mono text-xs uppercase">
              Trust & Architecture
            </Badge>
            <h2 className="text-3xl font-extrabold">Enterprise Governance & Security</h2>
            <p className="text-slate-400 text-sm md:text-base">
              Engineered with strict compliance standards to safeguard sensitive multi-tenant financial and operational data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {securitySpecs.map((spec, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-blue-500/40 transition-colors space-y-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <spec.icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">{spec.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{spec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enterprise Comparison Table */}
      <div className="py-24 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl p-8 md:p-12">
          <div className="text-center mb-10 space-y-2">
            <h3 className="text-2xl font-black text-slate-900">NexERP vs Legacy ERP Systems</h3>
            <p className="text-slate-600 text-sm">Clear technological advantages over traditional monolithic software.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider bg-slate-50">
                  <th className="py-4 px-4">Architecture Metric</th>
                  <th className="py-4 px-4">Legacy ERP Software</th>
                  <th className="py-4 px-4 text-blue-600 font-extrabold">NexERP Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs md:text-sm">
                {comparison.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800">{item.feature}</td>
                    <td className="py-4 px-4 text-slate-500">{item.legacy}</td>
                    <td className="py-4 px-4 font-black text-emerald-600">{item.nexerp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Corporate CTA */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-10 md:p-16 text-center text-white shadow-2xl border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Transform Your Business Operations Today
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Schedule a personalized walkthrough with our solution architects and discover how NexERP can streamline your workflows.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link 
                href="/contact" 
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }), 
                  "bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-blue-600/30"
                )}
              >
                Schedule Executive Demo
              </Link>
              <Link 
                href="/pricing" 
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }), 
                  "border-slate-700 text-slate-200 hover:bg-slate-800 h-12 rounded-xl px-8"
                )}
              >
                View Transparent Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}


