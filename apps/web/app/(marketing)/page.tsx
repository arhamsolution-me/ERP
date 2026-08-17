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
      badge: "All-in-One Inventory & Warehouse Management",
      title: "Smarter Inventory. Stronger Business. Better Growth.",
      desc: "Real-time tracking, multi-warehouse transfers, and powerful analytics — all in one intelligent platform built to scale with your business.",
      tag: "Smart Warehousing"
    },
    {
      id: 2,
      image: "/slide2.png",
      badge: "Textile Manufacturing Execution System (MES)",
      title: "Batch Lot Precision. Zero Wastage. Maximum Yield.",
      desc: "Track raw yarn lots, spinning looms, dyeing recipes, and machine downtime with live quality control scorecards.",
      tag: "Mill Production MES"
    },
    {
      id: 3,
      image: "/slide3.png",
      badge: "AI Analytics & Financial Automation",
      title: "Predictive Intelligence. Accelerated Corporate Growth.",
      desc: "Continuous double-entry general ledger, instant bank reconciliation, and machine-learning demand forecasting.",
      tag: "Enterprise Analytics"
    },
    {
      id: 4,
      image: "/slide4.png",
      badge: "Exponential Corporate Revenue Growth",
      title: "Data-Driven Decisions. Unlimited Enterprise Scale.",
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
      <section className="relative flex items-center bg-white border-b border-slate-200 overflow-hidden pt-32 sm:pt-36 pb-16 min-h-[660px] lg:min-h-[720px]">
        
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
          <div className="max-w-3xl space-y-8">
            
            {/* Animated Category Badge */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentSlide}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50/90 border border-sky-200/90 text-sky-700 text-xs sm:text-sm font-bold shadow-sm backdrop-blur-md"
              >
                <span className="flex h-2 w-2 rounded-full bg-sky-600 animate-pulse" />
                <Box className="w-4 h-4 text-sky-600" />
                <span>{slides[currentSlide].badge}</span>
                <span className="ml-2 pl-2 border-l border-sky-200/90 text-sky-500 font-mono text-[11px] font-bold">
                  0{currentSlide + 1} / 0{slides.length}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Dynamic Animated Title */}
            <AnimatePresence mode="wait">
              <motion.h1 
                key={currentSlide}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]"
              >
                {slides[currentSlide].title.split('. ')[0]}. <br />
                <span className="bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent drop-shadow-xs">
                  {slides[currentSlide].title.split('. ').slice(1).join('. ')}
                </span>
              </motion.h1>
            </AnimatePresence>

            {/* Description */}
            <AnimatePresence mode="wait">
              <motion.p 
                key={currentSlide}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-slate-600 text-lg sm:text-xl max-w-2xl leading-relaxed font-normal"
              >
                {slides[currentSlide].desc}
              </motion.p>
            </AnimatePresence>

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

      {/* FEATURE HIGHLIGHTS SECTION */}
      <section className="py-24 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-sky-600">Built for Modern Operations</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900">One Integrated Platform. Every Key Workflow.</h3>
            <p className="text-slate-600 text-base">Eliminate data silos between your factory floor, warehouses, retail stores, and finance team.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-200 hover:border-sky-500/50 hover:shadow-xl transition-all group">
              <div className="bg-sky-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-sky-600 group-hover:text-white transition-all">
                <Factory className="h-7 w-7 text-sky-600 group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Textile Production (MES)</h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">Track batches, raw materials, weaving metrics, dyeing recipes, and machine downtime in real-time.</p>
              <Link href="/features#production" className="text-sky-600 font-bold text-sm hover:underline flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore Production MES <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-200 hover:border-emerald-500/50 hover:shadow-xl transition-all group">
              <div className="bg-emerald-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Store className="h-7 w-7 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Retail POS &amp; Inventory</h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">High-speed barcode checkout counters, offline operation mode, inter-branch stock transfers, and customer loyalty.</p>
              <Link href="/features#inventory" className="text-emerald-600 font-bold text-sm hover:underline flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore Retail &amp; Stock <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-200 hover:border-purple-500/50 hover:shadow-xl transition-all group">
              <div className="bg-purple-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <TrendingUp className="h-7 w-7 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Finance &amp; AI Forecasting</h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">Automated general ledger, automated bank reconciliation, and machine-learning demand forecasting models.</p>
              <Link href="/features#finance" className="text-purple-600 font-bold text-sm hover:underline flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore Finance &amp; AI <ArrowRight className="h-4 w-4" />
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


