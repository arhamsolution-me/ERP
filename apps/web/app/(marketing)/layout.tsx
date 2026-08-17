import type { Metadata } from 'next';
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingFooter } from "@/components/marketing-footer";

export const metadata: Metadata = {
  title: {
    template: '%s | NexERP by Devnexes',
    default: 'NexERP | The Modern ERP for Textile and Retail',
  },
  description: 'NexERP by Devnexes is a powerful, multi-tenant SaaS ERP platform built for the modern textile and retail industries.',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      {/* Marketing Modern Mega Menu Header Navbar */}
      <MarketingHeader />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Ultra-Professional Enterprise Marketing Footer */}
      <MarketingFooter />
    </div>
  );
}
