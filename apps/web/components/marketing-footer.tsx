"use client";

import Link from "next/link";
import { 
  Box, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Cpu, 
  Globe, 
  Mail, 
  Share2,
  Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarketingFooter() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-20 pb-12 border-t border-slate-800 relative overflow-hidden font-sans">
      
      {/* Background Decorative Accent Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* PRE-FOOTER CTA CARD */}
        <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-900/40 border border-slate-800 rounded-3xl p-8 sm:p-12 mb-16 shadow-2xl backdrop-blur-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Devnexes Digital Solutions
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to Accelerate Your Enterprise?
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Join leading textile mills, multi-warehouse logistics providers, and retail chains running on NexERP.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <input 
              type="email" 
              placeholder="Enter your corporate email..." 
              className="w-full sm:w-80 h-12 px-4 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            <Button className="w-full sm:w-auto h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 group transition-all shrink-0">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* MAIN FOOTER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-slate-800/80">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-2 text-white shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black tracking-tight text-white font-sans">
                    Nex<span className="text-blue-500">ERP</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-950 text-[10px] font-extrabold text-blue-400 border border-blue-800">
                    PRO
                  </span>
                </div>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-sans">
                  Devnexes Digital Solutions
                </span>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Next-generation multi-tenant enterprise ERP platform engineered for textile mills, spinning looms, multi-warehouse supply chains, and retail networks.
            </p>

            {/* Compliance & Security Tags */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>SOC2 Type II</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>ISO 27001 Certified</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>99.99% SLA Uptime</span>
              </div>
            </div>
          </div>

          {/* Column 1: Capabilities */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Capabilities
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link href="/features" className="hover:text-blue-400 transition-colors">Textile Factory MES</Link></li>
              <li><Link href="/features" className="hover:text-blue-400 transition-colors">Smart Inventory & WMS</Link></li>
              <li><Link href="/features" className="hover:text-blue-400 transition-colors">AI Financial GL</Link></li>
              <li><Link href="/features" className="hover:text-blue-400 transition-colors">Retail POS Network</Link></li>
              <li><Link href="/features" className="hover:text-blue-400 transition-colors">Multi-Store Transfers</Link></li>
              <li><Link href="/features" className="hover:text-blue-400 transition-colors">Yield Optimization</Link></li>
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Enterprise Solutions
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Chenab Textiles</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Gul Ahmed Mills</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Alkaram Mills</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Nishat Linen</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Sapphire Solutions</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-400 transition-colors">Custom Deployment</Link></li>
            </ul>
          </div>

          {/* Column 3: Company & Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-blue-400 transition-colors">About Devnexes</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-400 transition-colors">Pricing Plans</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Book a Demo</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Support Portal</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NexERP by Devnexes Digital Solutions. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/security" className="hover:text-slate-300 transition-colors">Security</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
          </div>

          <div className="flex items-center gap-3">
            <a href="#" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" aria-label="Globe">
              <Globe className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" aria-label="Share">
              <Share2 className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" aria-label="Developer Code">
              <Code2 className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" aria-label="Email">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
