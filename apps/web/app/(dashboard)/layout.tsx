import { getSession } from "@/lib/auth-session";
import { prisma } from "@repo/db";
import Link from "next/link";
import UserMenu from "@/components/UserMenu";
import {
  Box,
  Settings,
  LayoutDashboard,
  Layers,
  ShoppingBag,
  Boxes,
} from "lucide-react";

export interface DynamicNavItem {
  id: string;
  name: string;
  href: string;
  icon?: any;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let tenantName = "HQ Enterprise";
  let userEmail = "admin@nexerp.com";
  let activeModules: string[] = [];

  try {
    const session = await getSession();
    if (session) {
      userEmail = session.email;
      const dbUser = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { tenant: true },
      });

      if (dbUser?.tenant?.business_name) {
        tenantName = dbUser.tenant.business_name;
      }

      // Read active modules from Onboarding Audit Log
      const onboardingLog = await prisma.auditLog.findFirst({
        where: {
          tenant_id: session.tenantId,
          action: 'ONBOARDING_COMPLETED',
        },
        orderBy: { created_at: 'desc' },
      });

      if (onboardingLog?.after_json) {
        const payload = onboardingLog.after_json as any;
        if (Array.isArray(payload?.activeModules)) {
          activeModules = payload.activeModules;
        }
      }
    }
  } catch (err) {
    console.error('[Dashboard Session Warning]:', err);
  }

  // Dynamic Navigation Registry — Displays active module links
  const registeredServices: DynamicNavItem[] = [
    {
      id: 'sales-management',
      name: 'Sales Management',
      href: '/sales',
      icon: ShoppingBag,
    },
    {
      id: 'inventory-management',
      name: 'Inventory Management',
      href: '/inventory',
      icon: Boxes,
    },
  ];

  // Filter navigation items dynamically based on tenant's activated modules
  const filteredNavItems = registeredServices.filter((item) => activeModules.includes(item.id));

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-600/20">
            <Box className="w-5 h-5" />
          </div>
          <Link href="/dashboard" className="text-xl font-bold text-slate-900 tracking-tight">
            NexERP
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-blue-50 text-blue-700 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-blue-600" />
            <span>Dashboard</span>
          </Link>

          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-5 mb-2 px-3 flex items-center justify-between">
            <span>Activated Services ({filteredNavItems.length})</span>
          </div>

          {filteredNavItems.length === 0 ? (
            <div className="px-3 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-center text-xs text-slate-400 font-medium">
              No services added yet
            </div>
          ) : (
            filteredNavItems.map((item) => {
              const Icon = item.icon || Layers;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.name}</span>
                </Link>
              );
            })
          )}

          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-6 mb-2 px-3">
            Settings &amp; Admin
          </div>
          <Link
            href="/settings/modules"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Manage Services</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <button className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
              <span className="text-xs font-bold text-slate-800">{tenantName}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <UserMenu email={userEmail} tenantName={tenantName} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
