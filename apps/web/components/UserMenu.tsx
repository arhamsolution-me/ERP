"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, ShieldCheck } from 'lucide-react';

interface UserMenuProps {
  email?: string;
  tenantName?: string;
}

export default function UserMenu({ email = 'admin@nexerp.com', tenantName }: UserMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const initial = (email && email.length > 0 ? email.charAt(0) : 'A').toUpperCase();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/sign-in');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shadow-sm text-sm">
          {initial}
        </div>
        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-bold text-slate-800 tracking-tight">{email}</span>
          <span className="text-[10px] text-slate-500 font-medium">{tenantName || 'Enterprise HQ'}</span>
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 text-slate-800">
            <div className="p-3 border-b border-slate-100">
              <p className="text-xs text-slate-400 font-medium">Signed in as</p>
              <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{email}</p>
              <div className="inline-flex items-center gap-1 mt-2 text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">
                <ShieldCheck className="w-3 h-3 text-blue-600" /> PostgreSQL DB Authenticated
              </div>
            </div>

            <div className="py-1">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>{loggingOut ? 'Signing out...' : 'Sign Out / Logout'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
