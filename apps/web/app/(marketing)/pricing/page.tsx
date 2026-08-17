"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-xl text-slate-600">
            Choose the plan that fits your business scale. No hidden fees.
          </p>
          
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!annual ? "text-slate-900" : "text-slate-500"}`}>Monthly</span>
            <button 
              onClick={() => setAnnual(!annual)}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${annual ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? "text-slate-900" : "text-slate-500"}`}>
              Annually <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Starter Plan */}
          <div className="border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col">
            <h3 className="text-2xl font-bold text-slate-900">Retail Starter</h3>
            <p className="mt-2 text-slate-500 text-sm">Perfect for single-store retail businesses.</p>
            <div className="mt-6 flex items-baseline text-5xl font-extrabold text-slate-900">
              ${annual ? "49" : "59"}
              <span className="ml-1 text-xl font-medium text-slate-500">/mo</span>
            </div>
            <Link href="/contact" className="mt-8">
              <Button className="w-full" variant="outline">Start 14-day trial</Button>
            </Link>
            <ul className="mt-8 space-y-4 text-sm text-slate-600 flex-1">
              <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Up to 3 Users</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> 1 Branch / Location</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Basic POS & Inventory</li>
              <li className="flex items-center gap-3"><X className="h-5 w-5 text-slate-300" /> Production Module</li>
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-blue-600 rounded-3xl p-8 shadow-xl flex flex-col relative transform md:-translate-y-4">
            <div className="absolute top-0 right-8 -translate-y-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Growth</h3>
            <p className="mt-2 text-slate-500 text-sm">For growing mills and multi-branch retail.</p>
            <div className="mt-6 flex items-baseline text-5xl font-extrabold text-slate-900">
              ${annual ? "199" : "249"}
              <span className="ml-1 text-xl font-medium text-slate-500">/mo</span>
            </div>
            <Link href="/contact" className="mt-8">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Book a Demo</Button>
            </Link>
            <ul className="mt-8 space-y-4 text-sm text-slate-600 flex-1">
              <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-600" /> Up to 20 Users</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-600" /> Up to 5 Branches</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-600" /> Full Production Module</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-600" /> Advanced Finance & HR</li>
            </ul>
          </div>

          {/* Enterprise Plan */}
          <div className="border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col">
            <h3 className="text-2xl font-bold text-slate-900">Enterprise</h3>
            <p className="mt-2 text-slate-500 text-sm">For large scale manufacturing & nationwide retail.</p>
            <div className="mt-6 flex items-baseline text-5xl font-extrabold text-slate-900">
              Custom
            </div>
            <Link href="/contact" className="mt-8">
              <Button className="w-full" variant="outline">Contact Sales</Button>
            </Link>
            <ul className="mt-8 space-y-4 text-sm text-slate-600 flex-1">
              <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Unlimited Users</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Unlimited Branches</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Dedicated Account Manager</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Custom Integrations (API)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
