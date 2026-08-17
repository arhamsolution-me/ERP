"use client";

import { SignUp } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Box } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-slate-50">
      
      {/* Left side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative flex-col justify-between p-12">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-48 -left-48 w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        {/* Header */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-500 transition-colors">
              <Box className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">NexERP</span>
          </Link>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-lg mt-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">NexERP</span> network
            </h1>
            <p className="mt-6 text-lg text-slate-300">
              Create an account to digitize your entire enterprise workflow. Your 14-day free trial starts the moment you sign up.
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} NexERP Inc. All rights reserved.</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-md relative z-10">
          
          {/* Mobile Header (Only visible on small screens) */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Box className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-slate-900 tracking-tight">NexERP</span>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.4 }}
            className="flex justify-center"
          >
            <SignUp 
              path="/sign-up" 
              routing="path" 
              signInUrl="/sign-in" 
              forceRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "w-full shadow-2xl border border-slate-100 rounded-2xl",
                  headerTitle: "text-2xl font-bold text-slate-900",
                  headerSubtitle: "text-slate-500",
                  socialButtonsBlockButton: "border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 py-3 rounded-lg text-sm font-semibold transition-all",
                  formFieldInput: "rounded-lg border-slate-200 focus:ring-blue-600 focus:border-blue-600 h-11",
                  formFieldLabel: "text-slate-700 font-medium",
                  footerActionLink: "text-blue-600 font-medium hover:text-blue-700",
                }
              }}
            />
          </motion.div>
        </div>
      </div>
      
    </div>
  );
}
