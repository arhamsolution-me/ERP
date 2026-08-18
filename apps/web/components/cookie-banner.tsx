"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, ChevronDown, ChevronUp, Shield, BarChart2, Megaphone } from "lucide-react";

type CookiePreferences = {
  necessary: boolean;   // always true, non-toggleable
  analytics: boolean;
  marketing: boolean;
};

const COOKIE_NAME = "nex_cookie_consent";
const STORAGE_KEY = "nexerp_cookie_consent";
const CONSENT_VERSION = "1.0";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setConsentCookie(value: string, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax; Secure`;
}

function loadPreferences(): { version: string; preferences: CookiePreferences } | null {
  try {
    const raw = getCookie(COOKIE_NAME) || (typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function savePreferences(preferences: CookiePreferences) {
  const payload = JSON.stringify({ version: CONSENT_VERSION, preferences });
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, payload);
  }
  setConsentCookie(payload, 365);
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check Global Privacy Control (GPC) signal
    if (typeof navigator !== "undefined" && (navigator as unknown as { globalPrivacyControl?: boolean }).globalPrivacyControl) {
      // Auto-reject optional cookies per Docx 22 Step 5
      const minimal: CookiePreferences = { necessary: true, analytics: false, marketing: false };
      savePreferences(minimal);
      setVisible(false);
      return;
    }

    const saved = loadPreferences();
    if (!saved || saved.version !== CONSENT_VERSION) {
      // Show banner if no saved consent or version mismatch
      setVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const all: CookiePreferences = { necessary: true, analytics: true, marketing: true };
    savePreferences(all);
    setVisible(false);
  };

  const handleRejectAll = () => {
    const minimal: CookiePreferences = { necessary: true, analytics: false, marketing: false };
    savePreferences(minimal);
    setVisible(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop blur on expanded */}
          {expanded && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setExpanded(false)}
            />
          )}

          <motion.div
            key="banner"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-[480px] z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Cookie className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Cookie Preferences</h2>
                    <p className="text-xs text-slate-500 mt-0.5">NexERP by Devnexes</p>
                  </div>
                </div>
                <button
                  onClick={handleRejectAll}
                  aria-label="Dismiss and reject optional cookies"
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 pb-4">
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  We use cookies to improve your experience, analyse site traffic, and personalise content.
                  By clicking <strong>"Accept All"</strong> you consent to our use of cookies.{" "}
                  <a href="/privacy" className="text-indigo-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </a>
                </p>

                {/* Manage Preferences Toggle */}
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-3 flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                  aria-expanded={expanded}
                  id="cookie-manage-preferences"
                >
                  {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {expanded ? "Hide preferences" : "Manage preferences"}
                </button>

                {/* Expandable Preferences */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-2.5 border border-slate-100 rounded-xl p-3 bg-slate-50">
                        {/* Necessary */}
                        <CookieToggle
                          icon={<Shield className="w-4 h-4 text-emerald-600" />}
                          label="Necessary"
                          description="Required for authentication and security. Cannot be disabled."
                          checked={true}
                          disabled={true}
                          onToggle={() => {}}
                        />
                        {/* Analytics */}
                        <CookieToggle
                          icon={<BarChart2 className="w-4 h-4 text-blue-600" />}
                          label="Analytics"
                          description="Help us understand how visitors use the site."
                          checked={preferences.analytics}
                          disabled={false}
                          onToggle={(v) => setPreferences((p) => ({ ...p, analytics: v }))}
                        />
                        {/* Marketing */}
                        <CookieToggle
                          icon={<Megaphone className="w-4 h-4 text-amber-600" />}
                          label="Marketing"
                          description="Used to show you relevant ads and content."
                          checked={preferences.marketing}
                          disabled={false}
                          onToggle={(v) => setPreferences((p) => ({ ...p, marketing: v }))}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex gap-2 px-5 pb-5">
                {expanded ? (
                  <>
                    <button
                      onClick={handleSavePreferences}
                      id="cookie-save-preferences"
                      className="flex-1 py-2 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
                    >
                      Save Preferences
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      id="cookie-accept-all-expanded"
                      className="flex-1 py-2 px-4 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                    >
                      Accept All
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleRejectAll}
                      id="cookie-reject-all"
                      className="flex-1 py-2 px-4 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Reject All
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      id="cookie-accept-all"
                      className="flex-1 py-2 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
                    >
                      Accept All
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Sub-component ── */
function CookieToggle({
  icon,
  label,
  description,
  checked,
  disabled,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800">{label}</p>
        <p className="text-[11px] text-slate-500 leading-snug">{description}</p>
      </div>
      {/* Toggle */}
      <button
        role="switch"
        aria-checked={checked}
        aria-label={`Toggle ${label} cookies`}
        disabled={disabled}
        onClick={() => !disabled && onToggle(!checked)}
        className={`relative flex-shrink-0 mt-0.5 w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
          ${checked ? "bg-indigo-600" : "bg-slate-200"}
          ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
            ${checked ? "translate-x-4" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
}
