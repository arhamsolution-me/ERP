"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  CheckCircle2, 
  Factory, 
  Store, 
  TrendingUp, 
  Box, 
  Sparkles, 
  Play, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  ChevronLeft,
  PieChart,
  BarChart3,
  Layers,
  Lock,
  Globe2,
  PackageCheck,
  TrendingIsUp
} from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Homepage() {
  const slides = [
    {
      id: 1,
      image: "/slide1.png",
      title: "Smarter Inventory. Stronger Business. Better Growth.",
      desc: "Real-time tracking, multi-warehouse transfers, and powerful analytics — all in one intelligent platform built to scale with your business.",
      tag: "Smart Warehousing"
    },
    {
      id: 2,
      image: "/slide2.png",
      title: "Batch Lot Precision. Zero Wastage. Maximum Yield.",
      desc: "Track raw yarn lots, spinning looms, dyeing recipes, and machine downtime with live quality control scorecards.",
      tag: "Mill Production MES"
    },
    {
      id: 3,
      image: "/slide3.png",
      title: "Predictive Intelligence. Automated Finance. Accelerated Growth.",
      desc: "Continuous double-entry general ledger, instant bank reconciliation, and machine-learning demand forecasting.",
      tag: "Enterprise Analytics"
    },
    {
      id: 4,
      image: "/slide4.png",
      title: "Data-Driven Decisions. Real-Time Insights. Unlimited Scale.",
      desc: "Accelerate your bottom line with automated financial reporting, real-time POS insights, and predictive demand analytics.",
      tag: "Business Growth"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* WHITE THEME HERO SECTION WITH MULTI-IMAGE CAROUSEL */}
      <section className="relative flex items-center bg-white border-b border-slate-200 overflow-hidden pt-44 sm:pt-48 lg:pt-52 pb-24 sm:pb-28 min-h-[760px] lg:min-h-[820px]">
        
        {/* Background Multi-Image Slideshow */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${slides[currentSlide].image}')` }}
            />
          </AnimatePresence>
          
          {/* Balanced White Gradient Overlay for High Text Readability & Image Vibrancy */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/20 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-white/20 z-10" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-left">
          <div className="max-w-3xl space-y-7 pt-6 sm:pt-8">

            {/* Dynamic Animated Title in Fixed Height Container (Zero Layout Jump) */}
            <div className="min-h-[160px] sm:min-h-[200px] lg:min-h-[220px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.h1 
                  key={currentSlide}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]"
                >
                  {slides[currentSlide].title.split('. ')[0]}. <br />
                  <span className="bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent drop-shadow-xs">
                    {slides[currentSlide].title.split('. ').slice(1).join('. ')}
                  </span>
                </motion.h1>
              </AnimatePresence>
            </div>

            {/* Description in Fixed Height Container */}
            <div className="min-h-[56px] sm:min-h-[64px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.p 
                  key={currentSlide}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
                  className="text-slate-600 text-lg sm:text-xl max-w-2xl leading-relaxed font-normal"
                >
                  {slides[currentSlide].desc}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-4 pt-6">
              <Link 
                href="/sign-in" 
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }), 
                  "w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-bold text-base h-13 px-8 rounded-lg shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 group transition-all"
                )}
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/contact" 
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }), 
                  "w-full sm:w-auto bg-white/90 hover:bg-white text-slate-800 border-slate-300 font-bold text-base h-13 px-8 rounded-lg shadow-xs flex items-center justify-center gap-2"
                )}
              >
                <span>Book a Demo</span>
                <Play className="w-4 h-4 fill-slate-800 text-slate-800" />
              </Link>
            </div>

            {/* Benefit Strip at Bottom */}
            <div className="pt-8 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl text-left">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Secure &amp; Reliable</span>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                <Zap className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Real-time Sync</span>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                <TrendingUp className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Scalable Solution</span>
              </div>
            </div>

            {/* Carousel Navigation Controls */}
            <div className="pt-4 flex items-center justify-start gap-4">
              <button 
                onClick={prevSlide}
                className="p-2.5 rounded-full bg-white/90 hover:bg-white border border-slate-200 text-slate-700 shadow-md transition-all hover:scale-105"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      currentSlide === idx ? "w-8 bg-sky-600" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button 
                onClick={nextSlide}
                className="p-2.5 rounded-full bg-white/90 hover:bg-white border border-slate-200 text-slate-700 shadow-md transition-all hover:scale-105"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>

      </section>

      {/* ULTRA-PREMIUM FEATURE HIGHLIGHTS SECTION */}
      <section className="py-24 sm:py-32 bg-slate-50/60 border-b border-slate-200 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100/80 border border-sky-200/80 text-sky-700 text-xs font-extrabold uppercase tracking-widest shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse" />
              <span>Built for Modern Operations</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
              One Integrated Platform. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent">
                Every Key Workflow.
              </span>
            </h2>
            
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Eliminate data silos between your factory floor, multi-bin warehouses, retail store POS, and financial accounting team.
            </p>
          </div>

          {/* 3-Column Premium Enterprise Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Card 1: Textile Production (MES) */}
            <div className="bg-white p-8 sm:p-9 rounded-3xl border border-slate-200/90 shadow-md shadow-slate-200/50 hover:shadow-2xl hover:shadow-sky-500/10 hover:border-sky-500/50 hover:-translate-y-1.5 transition-all duration-300 relative group overflow-hidden flex flex-col justify-between">
              <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 to-blue-600 absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div>
                <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-sky-600/30 group-hover:scale-110 transition-transform">
                  <Factory className="h-7 w-7 text-white" />
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Textile Production (MES)</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
                  Track cotton batches, spinning looms, dyeing recipes, and machine downtime with live production scorecards.
                </p>

                {/* Feature Bullet Points */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100 mb-8">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
                    <span>Yarn Lot &amp; Weaving Loom Efficiency</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
                    <span>Chemical Vat Dyeing Recipes</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
                    <span>Shift Worker Yield &amp; Downtime Logs</span>
                  </div>
                </div>
              </div>

              <Link 
                href="/features#production" 
                className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700 group/link transition-colors pt-2"
              >
                <span>Explore Production MES</span>
                <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 2: Retail POS & Inventory */}
            <div className="bg-white p-8 sm:p-9 rounded-3xl border border-slate-200/90 shadow-md shadow-slate-200/50 hover:shadow-2xl hover:shadow-sky-500/10 hover:border-sky-500/50 hover:-translate-y-1.5 transition-all duration-300 relative group overflow-hidden flex flex-col justify-between">
              <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 to-blue-600 absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div>
                <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-sky-600/30 group-hover:scale-110 transition-transform">
                  <Store className="h-7 w-7 text-white" />
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Retail POS &amp; Inventory</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
                  High-speed barcode checkout counters, offline billing mode, inter-branch stock transfers, and customer loyalty.
                </p>

                {/* Feature Bullet Points */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100 mb-8">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
                    <span>1.2s High-Speed Barcode Checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
                    <span>Offline Transaction Queue &amp; Sync</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
                    <span>Multi-Branch Inter-Store Transfers</span>
                  </div>
                </div>
              </div>

              <Link 
                href="/features#inventory" 
                className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700 group/link transition-colors pt-2"
              >
                <span>Explore Retail &amp; Stock</span>
                <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 3: Finance & AI Forecasting */}
            <div className="bg-white p-8 sm:p-9 rounded-3xl border border-slate-200/90 shadow-md shadow-slate-200/50 hover:shadow-2xl hover:shadow-sky-500/10 hover:border-sky-500/50 hover:-translate-y-1.5 transition-all duration-300 relative group overflow-hidden flex flex-col justify-between">
              <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 to-blue-600 absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div>
                <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-sky-600/30 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Finance &amp; AI Forecasting</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
                  Automated double-entry general ledger, instant bank reconciliation, and machine-learning demand forecasting models.
                </p>

                {/* Feature Bullet Points */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100 mb-8">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
                    <span>Automated Double-Entry Ledger</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
                    <span>Direct Bank Statement Reconciliation</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
                    <span>ML Demand &amp; Cash Flow Predictions</span>
                  </div>
                </div>
              </div>

              <Link 
                href="/features#finance" 
                className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700 group/link transition-colors pt-2"
              >
                <span>Explore Finance &amp; AI</span>
                <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* POWERED BY DEVNEXES DIGITAL SOLUTIONS STRIP */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-4">Engineered &amp; Powered By</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-sans bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-200 bg-clip-text text-transparent">
              Devnexes Digital Solutions
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-3 max-w-xl mx-auto">
            Architecting next-generation SaaS enterprise operating systems &amp; multi-tenant cloud platforms.
          </p>
        </div>
      </section>
      
    </div>
  );
}


