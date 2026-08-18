import DashboardClient from './dashboard-client';

export default async function DashboardOverviewPage() {
  return (
    <div className="min-h-full p-4 md:p-8 bg-slate-50/50">
      <DashboardClient />
    </div>
  );
}
