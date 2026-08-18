'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  Layers,
  UserPlus,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Box,
  Loader2,
  Plus,
  Trash2,
  Globe,
  PackageX,
  Lock,
  Check,
  Mail,
  Phone,
  Store,
  GitBranch,
  ChevronDown,
  Clock,
  ShoppingBag,
  Boxes,
} from 'lucide-react';
import { WORLD_COUNTRIES } from '@/lib/countries';
import CountrySelector from '@/components/CountrySelector';

export interface ERPModuleDefinition {
  id: string;
  name: string;
  category: string;
  desc: string;
  icon?: any;
}

// Custom Services List
const ALL_MODULES: ERPModuleDefinition[] = [
  {
    id: 'sales-management',
    name: 'Sales Management',
    category: 'Sales & Revenue',
    icon: ShoppingBag,
    desc: 'Quotations, orders, invoices, sales tracking',
  },
  {
    id: 'inventory-management',
    name: 'Inventory Management',
    category: 'Stock & Operations',
    icon: Boxes,
    desc: 'Products, stock, warehouses, stock movement',
  },
];

// 8-Digit OTP Input Box Component with Auto-Advance & Auto-Accept
function OtpInput8Digit({
  value,
  onChange,
  onComplete,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  onComplete: (val: string) => void;
  disabled?: boolean;
}) {
  const digits = value.padEnd(8, '').split('').slice(0, 8);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digitVal: string) => {
    const cleaned = digitVal.replace(/\D/g, '');
    if (!cleaned) {
      const newDigits = [...digits];
      newDigits[index] = '';
      const newVal = newDigits.join('').trim();
      onChange(newVal);
      return;
    }

    if (cleaned.length > 1) {
      const pastedCode = cleaned.slice(0, 8);
      onChange(pastedCode);
      if (pastedCode.length === 8) {
        onComplete(pastedCode);
        inputRefs.current[7]?.focus();
      } else {
        inputRefs.current[Math.min(pastedCode.length, 7)]?.focus();
      }
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleaned;
    const newVal = newDigits.join('');
    onChange(newVal);

    if (index < 7 && cleaned) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newVal.length === 8) {
      onComplete(newVal);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
      {Array.from({ length: 8 }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={8}
          value={digits[idx] || ''}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          className={`w-9 sm:w-11 h-12 sm:h-13 rounded-xl border text-center text-lg sm:text-xl font-mono font-bold transition-all focus:outline-none shadow-sm ${
            digits[idx]
              ? 'border-sky-600 bg-sky-50/60 text-slate-900 ring-2 ring-sky-500/15'
              : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20'
          }`}
        />
      ))}
    </div>
  );
}

export default function StandaloneOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State — Currency & Timezone completely removed!
  const [businessName, setBusinessName] = useState('My Enterprise Workspace');
  const [country, setCountry] = useState('Pakistan');

  // Org Scale & Branches State
  const [orgSize, setOrgSize] = useState<'solo' | 'team'>('team');
  const [teamCountRange, setTeamCountRange] = useState('1-5');
  const [branchCount, setBranchCount] = useState(1);
  const [hasNoBranch, setHasNoBranch] = useState(false);

  // Email Verification State & 60s Live Timer
  const [email, setEmail] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [demoCodeHint, setDemoCodeHint] = useState('');
  const [emailStatusMsg, setEmailStatusMsg] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);

  // Auto Prefill Registered User's Email on Page Load
  useEffect(() => {
    const fetchUserEmail = async () => {
      // 1. Try local storage first for instant prefill
      if (typeof window !== 'undefined') {
        const savedRegEmail = localStorage.getItem('nexerp_registered_email') || localStorage.getItem('nexerp_remembered_email');
        if (savedRegEmail && savedRegEmail.includes('@')) {
          setEmail(savedRegEmail);
        }
      }

      // 2. Fetch authenticated user session email from /api/auth/me
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user?.email) {
            setEmail(data.user.email);
            if (data.user.tenantName) {
              setBusinessName(data.user.tenantName);
            }
          }
        }
      } catch (e) {
        console.warn('Could not fetch user session email:', e);
      }
    };

    fetchUserEmail();
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isCodeSent && otpTimer > 0 && !isEmailVerified) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCodeSent, otpTimer, isEmailVerified]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendRealOtp = async () => {
    if (!email || !email.includes('@')) {
      setEmailError('Pehlay sahi email address enter karain!');
      return;
    }

    try {
      setSendingCode(true);
      setEmailError('');
      setOtpTimer(60);
      const res = await fetch('/api/onboarding/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCodeSent(true);
        if (data.emailSent) {
          setEmailStatusMsg(`Verification code sent on your mail`);
          setDemoCodeHint('');
        } else {
          setEmailStatusMsg(`Verification code sent on your mail`);
          setDemoCodeHint(data.demoCode || '12345678');
        }
      } else {
        setEmailError(data.error || 'Failed to send verification email');
      }
    } catch (err: any) {
      setEmailError('Network error while sending verification email');
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyRealOtp = async (codeToVerify?: string) => {
    const targetCode = codeToVerify || verificationCode;
    if (!targetCode || targetCode.trim().length !== 8) {
      setCodeError('Please enter valid 8-digit code');
      return;
    }

    try {
      setVerifyingCode(true);
      setCodeError('');
      const res = await fetch('/api/onboarding/send-otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: targetCode }),
      });
      const data = await res.json();
      if (data.success && data.verified) {
        setIsEmailVerified(true);
        setCodeError('');
      } else {
        setCodeError(data.error || 'Invalid 8-digit verification code');
      }
    } catch (err: any) {
      setCodeError('Network error while verifying code');
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleNextStep1 = () => {
    if (!isEmailVerified) {
      if (!email.trim()) {
        setEmailError('Pehlay email Enter karain aur 8-digit code verify karain!');
      } else if (!isCodeSent) {
        setEmailError('Please click "Verify" to get the 8-digit verification code.');
        handleSendRealOtp();
      } else {
        setEmailError('Please enter the 8-digit verification code and click "Confirm Code".');
      }
      return;
    }
    setEmailError('');
    setStep(2);
  };

  // Module Selection (0 selected by default, 1 required)
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [moduleError, setModuleError] = useState('');

  // Fetch registered tenant info on mount (Auto-fill & Lock Company Name)
  useEffect(() => {
    async function loadTenantInfo() {
      try {
        const res = await fetch('/api/onboarding');
        const data = await res.json();
        if (data.success && data.businessName) {
          setBusinessName(data.businessName);
          if (data.country) setCountry(data.country === 'Pakistani' ? 'Pakistan' : data.country);
        }
      } catch (err) {
        console.error('Failed to load tenant info:', err);
      }
    }
    loadTenantInfo();
  }, []);

  const toggleModule = (id: string) => {
    setModuleError('');
    if (selectedModules.includes(id)) {
      setSelectedModules(selectedModules.filter((m) => m !== id));
    } else {
      setSelectedModules([...selectedModules, id]);
    }
  };

  const handleNextStep2 = () => {
    if (selectedModules.length === 0) {
      setModuleError('Please select at least 1 service to continue.');
      return;
    }
    setModuleError('');
    setStep(3);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          country,
          orgSize,
          teamCountRange,
          branchCount,
          activeModules: selectedModules,
          teamInvites: [],
        }),
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('nexerp_active_modules', JSON.stringify(selectedModules));
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Onboarding finish error:', err);
      setLoading(false);
    }
  };

  const STEPS = [
    { number: 1, label: 'Workspace Details', desc: 'Company profile, team size & branch setup' },
    { number: 2, label: 'Service Selection', desc: 'Select active services for your business' },
    { number: 3, label: 'Review', desc: 'Finalize workspace initialization' },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Blue Info Bar - EXACT match to main site top bar */}
      <div className="w-full bg-sky-700 text-white py-2.5 px-6 md:px-12 border-b border-sky-800/80 shadow-sm z-50 relative">
        <div className="container mx-auto flex items-center justify-between text-xs sm:text-sm font-bold">
          {/* Left: Social Media Logos (Facebook, Instagram, GitHub, LinkedIn, X, YouTube) */}
          <div className="flex items-center gap-4 text-white">
            {/* Facebook */}
            <a href="#" className="hover:text-sky-200 transition-transform hover:scale-110" aria-label="Facebook">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" className="hover:text-sky-200 transition-transform hover:scale-110" aria-label="Instagram">
              <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            {/* GitHub */}
            <a href="#" className="hover:text-sky-200 transition-transform hover:scale-110" aria-label="GitHub">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="#" className="hover:text-sky-200 transition-transform hover:scale-110" aria-label="LinkedIn">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.762-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            {/* X / Twitter */}
            <a href="#" className="hover:text-sky-200 transition-transform hover:scale-110" aria-label="X (Twitter)">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* YouTube */}
            <a href="#" className="hover:text-sky-200 transition-transform hover:scale-110" aria-label="YouTube">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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

      {/* Full Width Top Header (Edge-to-Edge with Top Progress Bar) */}
      <header className="w-full bg-white border-b border-slate-200/90 px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm shadow-slate-900/5 relative">
        {/* Top Animated Progress Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-3">
          <Image
            src="/infinite-logo.png"
            alt="NexERP Logo"
            width={40}
            height={40}
            className="h-10 w-auto object-contain rounded-lg shadow-sm"
          />
          <div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">{businessName || 'NexERP'}</span>
            <p className="text-xs text-slate-500 font-medium">Enterprise Workspace Setup</p>
          </div>
        </div>

        {/* Clean Step Breadcrumbs Navigator */}
        <div className="flex items-center gap-4">
          {/* Step Badges List for Desktop */}
          <div className="hidden lg:flex items-center gap-6 mr-2">
            {STEPS.map((s) => {
              const isCurrent = s.number === step;
              const isDone = s.number < step;
              return (
                <div
                  key={s.number}
                  className={`flex items-center gap-2 text-xs font-semibold transition-all ${isCurrent
                    ? 'text-blue-600 font-bold'
                    : isDone
                      ? 'text-slate-800'
                      : 'text-slate-400'
                    }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${isCurrent
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : isDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                      }`}
                  >
                    {isDone ? '✓' : s.number}
                  </span>
                  <span>{s.label}</span>
                </div>
              );
            })}
          </div>

          {/* Current Step Badge */}
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-extrabold text-slate-900">
              Step {step} of 3
            </span>
          </div>
        </div>
      </header>

      {/* FULL-WIDTH SPREAD CANVAS LAYOUT */}
      <main className="w-full max-w-7xl mx-auto pt-10 pb-20 px-6 md:px-12 space-y-8 flex-1">
        {/* Step Header */}
        <div className="space-y-1.5 text-left border-b border-slate-200/80 pb-5">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full inline-block">
            Setup Step {step} of 3
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            {STEPS[step - 1]?.label}
          </h1>
        </div>

        {/* STEP FORM SWITCHER */}
        <AnimatePresence mode="wait">
          {/* STEP 1: ONBOARDING FORM */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-white/90 backdrop-blur-sm border border-slate-200/90 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8"
            >
              {/* UNIFIED 2-COLUMN GRID FOR ALL FORM FIELDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Business Name (LOCKED & READ-ONLY) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-700 uppercase tracking-wider block">
                      Business Name
                    </label>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      <Lock className="w-3 h-3 text-emerald-600" /> Auto-filled
                    </span>
                  </div>
                  <div className="relative">
                    <Building2 className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={businessName}
                      className="w-full bg-slate-100/90 border border-slate-200 rounded-xl py-3.5 pl-12 pr-10 text-sm font-normal text-slate-800 cursor-not-allowed select-none"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 2. Country Select */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700 uppercase tracking-wider block">
                    Country
                  </label>
                  <CountrySelector value={country} onChange={setCountry} />
                </div>

                {/* 3. Work Email Verification (BEFORE Team & Branches) */}
                <div className="space-y-2 col-span-1 md:col-span-2 border-t border-b border-slate-200/80 py-4 my-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-700 uppercase tracking-wider block">
                      Work Email Address <span className="text-rose-500">*</span>
                    </label>
                    {isEmailVerified ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                        <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" /> Verified Email
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                        <Lock className="w-3 h-3 text-slate-500" /> Registered Email
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                    <input
                      type="email"
                      value={email}
                      readOnly
                      placeholder="admin@enterprise.com"
                      className={`w-full border rounded-xl py-3.5 pl-12 pr-28 text-sm font-medium focus:outline-none transition-all h-[50px] cursor-not-allowed select-none ${
                        isEmailVerified
                          ? 'bg-emerald-50/50 border-emerald-300 text-slate-900'
                          : 'bg-slate-100/90 border-slate-200 text-slate-800'
                      }`}
                    />

                    {/* Verify Button inside Input */}
                    {!isEmailVerified && (
                      <button
                        type="button"
                        disabled={!email.trim() || sendingCode}
                        onClick={handleSendRealOtp}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-sky-700 hover:bg-sky-800 disabled:opacity-40 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        {sendingCode ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Sending...
                          </>
                        ) : isCodeSent ? (
                          'Resend Code'
                        ) : (
                          'Verify'
                        )}
                      </button>
                    )}
                  </div>

                  {emailError && !isEmailVerified && (
                    <p className="text-xs text-rose-600 font-semibold pt-1 flex items-center gap-1.5 animate-fadeIn">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                      {emailError}
                    </p>
                  )}

                  {/* 8-Digit Verification OTP Code Box (No Outer Box background, with live timer) */}
                  {isCodeSent && !isEmailVerified && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3 mt-3 pt-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <Mail className="w-4 h-4 text-sky-700" /> {emailStatusMsg || 'Verification code sent on your mail'}
                        </span>

                        {/* Live Countdown Timer */}
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
                          <span>{otpTimer > 0 ? formatTimer(otpTimer) : 'Expired'}</span>
                        </div>
                      </div>

                      {/* 8 Separate Digit Box Inputs with Auto-Advance & Auto-Accept */}
                      <OtpInput8Digit
                        value={verificationCode}
                        disabled={verifyingCode}
                        onChange={(val) => {
                          setVerificationCode(val);
                          setCodeError('');
                        }}
                        onComplete={(codeVal) => {
                          handleVerifyRealOtp(codeVal);
                        }}
                      />

                      <div className="flex items-center justify-between pt-1">
                        {demoCodeHint ? (
                          <span className="text-[11px] font-mono font-semibold text-slate-500">
                            Demo Code: <strong className="text-slate-800">{demoCodeHint}</strong>
                          </span>
                        ) : <div />}

                        {/* Resend Code Button with Timer condition */}
                        {otpTimer === 0 ? (
                          <button
                            type="button"
                            disabled={sendingCode}
                            onClick={() => {
                              setOtpTimer(60);
                              handleSendRealOtp();
                            }}
                            className="text-xs font-bold text-sky-700 hover:text-sky-800 hover:underline cursor-pointer"
                          >
                            Resend Code
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            Resend code in {otpTimer}s
                          </span>
                        )}
                      </div>

                      {verifyingCode && (
                        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-sky-700 pt-1">
                          <Loader2 className="w-4 h-4 animate-spin text-sky-700" />
                          Verifying code...
                        </div>
                      )}

                      {codeError && (
                        <p className="text-xs text-rose-600 font-semibold">{codeError}</p>
                      )}
                    </motion.div>
                  )}
                </div>

                  {/* 3. Team Size */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700 uppercase tracking-wider block">
                      Team Size
                    </label>
                    <div className="space-y-2">
                      <div className="relative">
                        <Users className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                        <select
                          value={teamCountRange}
                          onChange={(e) => setTeamCountRange(e.target.value)}
                          disabled={orgSize === 'solo'}
                          className={`w-full border rounded-xl py-3.5 pl-12 pr-10 text-sm font-normal focus:outline-none transition-all cursor-pointer h-[50px] appearance-none ${orgSize === 'solo'
                            ? 'bg-slate-100/90 border-slate-200 text-slate-400 cursor-not-allowed select-none'
                            : 'bg-white border-slate-200 text-slate-900 focus:border-sky-600 shadow-sm'
                            }`}
                        >
                          <option value="1-5">1 - 5 Team Members</option>
                          <option value="6-20">6 - 20 Team Members</option>
                          <option value="21-50">21 - 50 Team Members</option>
                          <option value="50+">50+ Enterprise Staff</option>
                        </select>

                        {orgSize !== 'solo' && (
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                        )}

                        {orgSize === 'solo' && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-slate-200/90 border border-slate-300/60 px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-600 pointer-events-none">
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span>Single User</span>
                          </div>
                        )}
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer pt-1 select-none w-fit">
                        <input
                          type="checkbox"
                          checked={orgSize === 'solo'}
                          onChange={(e) => setOrgSize(e.target.checked ? 'solo' : 'team')}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs font-normal text-slate-600 hover:text-slate-800 transition-colors">
                          I don't have a team
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* 4. Branches */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700 uppercase tracking-wider block">
                      Branches
                    </label>
                    <div className="space-y-2">
                      <div className="relative">
                        <Store className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={hasNoBranch ? 1 : branchCount}
                          disabled={hasNoBranch}
                          onChange={(e) => setBranchCount(parseInt(e.target.value) || 1)}
                          className={`w-full border rounded-xl py-3.5 pl-12 pr-10 text-sm font-normal focus:outline-none transition-all h-[50px] ${hasNoBranch
                            ? 'bg-slate-100/90 border-slate-200 text-slate-400 cursor-not-allowed select-none'
                            : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600 shadow-sm'
                            }`}
                        />

                        {hasNoBranch && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-slate-200/90 border border-slate-300/60 px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-600 pointer-events-none">
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span>1 Location</span>
                          </div>
                        )}
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer pt-1 select-none w-fit">
                        <input
                          type="checkbox"
                          checked={hasNoBranch}
                          onChange={(e) => {
                            setHasNoBranch(e.target.checked);
                            if (e.target.checked) setBranchCount(1);
                          }}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs font-normal text-slate-600 hover:text-slate-800 transition-colors">
                          I don't have a branch
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
            </motion.div>
          )}

          {/* STEP 2: SERVICE CANVAS */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              {ALL_MODULES.length === 0 ? (
                <div className="p-12 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-3 shadow-sm">
                  <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl mx-auto flex items-center justify-center">
                    <PackageX className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Clean Starting State (0 Preset Services)</h3>
                  <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed font-medium">
                    All preset services cleared as requested. Tell me which service to build first (e.g. Inventory, POS, Production), and we will build it step-by-step from scratch!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {ALL_MODULES.map((mod) => {
                    const isSelected = selectedModules.includes(mod.id);
                    const IconComp = mod.icon || Layers;
                    return (
                      <div
                        key={mod.id}
                        onClick={() => toggleModule(mod.id)}
                        className={`group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between select-none shadow-sm ${
                          isSelected
                            ? 'border-sky-600 bg-gradient-to-r from-sky-50/90 via-sky-50/40 to-white text-slate-900 ring-2 ring-sky-500/20 shadow-md shadow-sky-700/5'
                            : 'border-slate-200 hover:border-sky-300 bg-white hover:bg-slate-50/50 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`p-3 rounded-xl transition-colors ${
                            isSelected
                              ? 'bg-sky-700 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-700'
                          }`}>
                            <IconComp className="w-5 h-5" />
                          </div>

                          <div>
                            <span className="text-sm font-bold text-slate-900 tracking-tight block">
                              {mod.name}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-500 transition-colors">
                              {mod.category}
                            </span>
                          </div>
                        </div>

                        {/* Custom Modern Checkmark Circle */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-sky-700 text-white shadow-sm scale-110'
                            : 'border-2 border-slate-300 bg-white group-hover:border-sky-400'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {moduleError && (
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 pt-1 animate-fadeIn">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                  {moduleError}
                </p>
              )}
            </motion.div>
          )}

          {/* STEP 3: EXECUTIVE WORKSPACE REVIEW SUMMARY */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      Workspace Summary
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Review details before initializing your enterprise environment
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ready to Launch
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-sans">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Workspace Name
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 block">{businessName}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Operating Region
                    </span>
                    <span className="text-sm font-bold text-slate-900 block">{country === 'Pakistani' ? 'Pakistan' : country}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Verified Account Email
                    </span>
                    <span className="text-sm font-bold text-slate-900 block flex items-center gap-1.5">
                      {email || 'admin@enterprise.com'}
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Team Capacity &amp; Locations
                    </span>
                    <span className="text-sm font-bold text-slate-900 block capitalize">
                      {orgSize === 'solo' ? 'Single User' : `${teamCountRange} Members (${hasNoBranch ? '1 Location' : `${branchCount} Branches`})`}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-5 space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Subscribed Enterprise Services ({selectedModules.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ALL_MODULES.filter((m) => selectedModules.includes(m.id)).map((m) => (
                      <div key={m.id} className="flex items-center gap-2.5 bg-sky-50/70 border border-sky-200/80 px-4 py-2.5 rounded-xl text-xs font-bold text-sky-950">
                        <Check className="w-4 h-4 text-sky-700 stroke-[3]" />
                        <span>{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Bottom Controls */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-5 py-3.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-200/60 flex items-center gap-2 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1) {
                  handleNextStep1();
                } else if (step === 2) {
                  handleNextStep2();
                } else {
                  setStep(step + 1);
                }
              }}
              className="bg-sky-700 hover:bg-sky-800 text-white font-bold text-sm py-4 px-8 rounded-xl shadow-md shadow-sky-700/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-2"
            >
              <span>Continue &rarr;</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={loading}
              className="bg-sky-700 hover:bg-sky-800 text-white font-bold text-sm py-4 px-8 rounded-xl shadow-md shadow-sky-700/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <span>Finish &amp; Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
