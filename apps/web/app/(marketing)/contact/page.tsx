"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckCircle2, Send, Building2, User, Mail, MessageSquare, Box } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      company: formData.get("company"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to send");
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="absolute top-0 w-full p-6 z-50">
        <Link href="/" className="flex items-center gap-2 group w-fit">
          <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-500 transition-colors">
            <Box className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">NexERP</span>
        </Link>
      </header>

      <div className="container mx-auto px-4 pt-32 pb-24">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Book a Demo</h1>
          <p className="text-lg text-slate-600">
            Tell us about your manufacturing or retail business, and we'll show you how NexERP can streamine your operations.
          </p>
        </div>

        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {status === "success" ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Sent Successfully!</h2>
              <p className="text-slate-600 mb-8">
                Thank you for your interest. Our enterprise team will get back to you within 24 hours to schedule your personalized demo.
              </p>
              <Link href="/" className={cn(buttonVariants({ variant: "default" }), "bg-blue-600 hover:bg-blue-700")}>
                Return Home
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
              {status === "error" && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm mb-6">
                  Something went wrong while sending your request. Please try again later.
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" /> Full Name
                </label>
                <Input required name="name" placeholder="Your Full Name" className="h-12 bg-slate-50" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" /> Work Email
                </label>
                <Input required type="email" name="email" placeholder="name@company.com" className="h-12 bg-slate-50" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" /> Company Name
                </label>
                <Input required name="company" placeholder="Your Company Name" className="h-12 bg-slate-50" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" /> How can we help?
                </label>
                <Textarea required name="message" placeholder="Tell us about your requirements..." className="min-h-[120px] bg-slate-50" />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Sending..." : <><Send className="w-5 h-5 mr-2" /> Request Demo</>}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
