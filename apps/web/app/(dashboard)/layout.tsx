import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            NexERP
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
          <Link href="/dashboard" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-900 bg-gray-100">
            Dashboard
          </Link>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2 px-3">
            Modules
          </div>
          <Link href="/production" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">
            Production
          </Link>
          <Link href="/inventory" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">
            Inventory
          </Link>
          <Link href="/purchase/vendors" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">
            Purchase & Vendors
          </Link>
          <Link href="/sales" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">
            Sales & POS
          </Link>
          <Link href="/finance" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">
            Finance
          </Link>
          <Link href="/hr" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">
            HR & Payroll
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <button className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <span className="sr-only">Open sidebar</span>
              {/* Menu Icon */}
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-slate-700">HQ Tenant</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <UserButton />
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
