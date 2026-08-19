'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Mail,
  Building2,
  Loader2,
  Eye,
  EyeOff,
  Box,
  TrendingUp,
  Phone,
} from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isPageSwitching, setIsPageSwitching] = useState(false);
  const [showLogoSpinner, setShowLogoSpinner] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to create account. Please try again.');
        setLoading(false);
        return;
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('nexerp_registered_email', email);
      }

      // Step 1: Trigger 3D Left-to-Right Page Flip Animation
      setIsFlipping(true);

      // Step 2: Reveal stable center logo + blue ring spinner smoothly at 380ms
      setTimeout(() => {
        setShowLogoSpinner(true);
      }, 380);

      // Step 3: Navigate to 5-step Onboarding Wizard (Docx 23)
      setTimeout(() => {
        router.push('/onboarding');
        router.refresh();
      }, 1200);
    } catch {
      setError('An unexpected connection error occurred. Please try again.');
      setLoading(false);
    }
  };

  // Smooth Page Shifting Animation back to Login Page (Right Side)
  const handleSwitchToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPageSwitching(true);
    setTimeout(() => {
      router.push('/sign-in');
    }, 450);
  };

  return (
    <div className="min-h-screen bg-slate-100/80 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
      {/* Top Blue Info Bar - EXACT match to main site top bar */}
      <div className="w-full bg-sky-700 text-white py-2.5 px-4 sm:px-6 border-b border-sky-800/80 shadow-sm">
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
            <a href="mailto:support@devnexes.com" className="flex items-center gap-2 hover:text-sky-200 transition-colors">
              <Mail className="w-4 h-4 text-sky-400" />
              <span>support@devnexes.com</span>
            </a>

            <a href="tel:+923030111550" className="flex items-center gap-2 hover:text-sky-200 transition-colors">
              <Phone className="w-4 h-4 text-sky-200" />
              <span>+92 3030111550</span>
            </a>
          </div>
        </div>
      </div>

      {/* Expanded Widescreen Main Card Container - Perfectly Centered */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 my-auto">
        <div className="w-full max-w-6xl min-h-[700px] book-perspective relative z-10 mx-auto">
        <div
          className={`w-full h-full bg-white border border-slate-200/90 rounded-2xl grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative min-h-[700px] transition-all duration-500 ease-in-out ${
            showLogoSpinner ? 'shadow-none' : 'shadow-xl shadow-slate-900/5'
          }`}
        >
          {/* STEP 2 REVEAL: STABLE LOGO IN CENTER WITH ROTATING BLUE CIRCLE RING */}
          {showLogoSpinner && (
            <div className="absolute inset-0 bg-white z-50 p-12 flex items-center justify-center text-center animate-fadeIn">
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* 360-degree Rotating Blue Circular Ring */}
                <div className="absolute inset-0 rounded-full border-[3.5px] border-slate-100 border-t-blue-600 border-r-blue-600 animate-spin" />

                {/* Stable Center Logo */}
                <div className="w-24 h-24 flex items-center justify-center p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/30">
                  <Box className="w-12 h-12" />
                </div>
              </div>
            </div>
          )}

          {/* LEFT PAGE (Col 6): REGISTER FORM (Placed on LEFT side!) */}
          <div
            className={`lg:col-span-6 bg-white relative flex flex-col justify-between p-8 md:p-14 z-30 border-b lg:border-b-0 lg:border-r border-slate-200/80 origin-right transition-all duration-700 ease-in-out order-2 lg:order-1 ${
              isFlipping || isPageSwitching
                ? '[transform:rotateY(180deg)] bg-white opacity-0 pointer-events-none'
                : '[transform:rotateY(0deg)] opacity-100'
            }`}
          >
            {/* MAIN FORM */}
            <div className="space-y-8 my-auto">
              {/* Soft & Elegant Modern Header */}
              <div className="space-y-1 text-left">
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  Join NexERP
                </h2>
                <h3 className="text-sm font-semibold text-blue-600 tracking-tight">
                  Enterprise Workspace Registration
                </h3>
              </div>

              {/* Register Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium animate-fadeIn">
                    {error}
                  </div>
                )}

                {/* Company Name Field */}
                <div className="relative">
                  <Building2 className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                  <input
                    id="company-input"
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Company / Business Name"
                    className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all"
                  />
                </div>

                {/* Email Field */}
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                  <input
                    id="email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Work Email Address"
                    className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all"
                  />
                </div>

                {/* Password Field */}
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 6 chars)"
                    className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer z-10"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={loading || isFlipping || isPageSwitching}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base py-3.5 px-4 rounded-xl shadow-md shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating workspace...
                    </>
                  ) : (
                    'Create Workspace & Register'
                  )}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-600 font-medium">
                Already have an enterprise account?{' '}
                <button
                  onClick={handleSwitchToLogin}
                  className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Log In / Sign In &rarr;</span>
                </button>
              </p>
            </div>
          </div>

          {/* RIGHT PAGE: Pure Minimalist Logo + Dynamic Graphic Animation */}
          <div
            className={`hidden lg:flex lg:col-span-6 p-8 md:p-12 flex-col items-center justify-between relative bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200/80 z-10 transition-all duration-500 ease-out order-1 lg:order-2 overflow-hidden ${
              isFlipping || isPageSwitching ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            {/* Top Simple Brand Title */}
            <div className="w-full flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-600/30 group-hover:bg-blue-700 transition-all group-hover:scale-105">
                  <Box className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                  NexERP
                </span>
              </Link>
            </div>

            {/* Standalone Rising Animated Wave Graph - Full Edge-to-Edge Span */}
            <div className="my-auto relative w-full flex flex-col items-center justify-center py-4 -mx-8 md:-mx-12 px-0">
              {/* Soft Ambient Background Glow */}
              <div className="absolute w-full h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

              {/* Standalone Wave Graph Container */}
              <div className="w-full relative z-10 space-y-6">
                
                {/* Metrics Floating Pill Header */}
                <div className="flex items-center justify-between px-8 md:px-12">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Realtime Enterprise Growth</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full shadow-sm">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+38.4% Upward Trend</span>
                  </div>
                </div>

                {/* SVG Standalone Rising Wave Graph Line (Stretches 100% Left Edge -> Right Edge) */}
                <div className="relative h-60 w-full pt-4">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="standaloneWaveGradSignUp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0284c7" stopOpacity="0.28" />
                        <stop offset="60%" stopColor="#0284c7" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Gradient Fill Below Wave */}
                    <path
                      d="M 0,140 Q 120,130 220,75 T 380,30 T 500,5 L 500,160 L 0,160 Z"
                      fill="url(#standaloneWaveGradSignUp)"
                    />

                    {/* Animated Wave Path Line */}
                    <path
                      d="M 0,140 Q 120,130 220,75 T 380,30 T 500,5"
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      className="animate-draw-wave"
                    />

                    {/* Glowing Accent Ring Data Points along the curve */}
                    <circle cx="50" cy="136" r="5" fill="#0284c7" className="animate-ping opacity-75" />
                    <circle cx="50" cy="136" r="5" fill="#0284c7" />

                    <circle cx="230" cy="72" r="6" fill="#0284c7" className="animate-ping opacity-75" />
                    <circle cx="230" cy="72" r="6" fill="#0284c7" />

                    <circle cx="495" cy="6" r="7" fill="#10b981" className="animate-ping opacity-75" />
                    <circle cx="495" cy="6" r="7" fill="#10b981" />
                  </svg>

                  {/* Floating Metric Tooltips on curve */}
                  <div className="absolute top-2 right-8 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-md flex items-center gap-2 animate-float-slow">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-900">$184,200</span>
                  </div>

                  <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-md flex items-center gap-2 animate-float-delay">
                    <span className="text-xs font-bold text-slate-700">$92,400</span>
                  </div>

                  <div className="absolute bottom-4 left-8 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-md flex items-center gap-2 animate-float-slow">
                    <span className="text-xs font-bold text-slate-600">$24,100</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Spacer for perfect balance */}
            <div className="h-4" />
          </div>
        </div>
      </div>
    </main>
  </div>
);
}
