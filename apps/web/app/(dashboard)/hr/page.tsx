import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, CalendarDays, CalendarClock } from "lucide-react";
import Link from "next/link";

export default function HRDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">HR Dashboard</h1>
          <p className="text-muted-foreground">
            Headcount, attendance overview, and pending leave requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/hr/payroll">
            <Button size="sm">
              Run Payroll
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Headcount</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground mt-1">
              85 Factory &bull; 45 Retail &bull; 12 Mgmt
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Today</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">92%</div>
            <p className="text-xs text-muted-foreground mt-1">
              130 of 142 scheduled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <CalendarDays className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">7</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting supervisor approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payroll</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4 Days</div>
            <p className="text-xs text-muted-foreground mt-1">
              Period ends Oct 31, 2023
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>
              Daily check-in percentages over the last 14 days
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-slate-50 rounded-md border border-dashed">
            <div className="text-sm text-muted-foreground text-center">
              [Line Chart Placeholder]<br/>
              Trend line of daily attendance %
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Pending Leave Requests</CardTitle>
            <CardDescription>
              Requires immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Ali Khan", type: "Sick Leave", dates: "Oct 28 - Oct 29", role: "Weaving Operator" },
                { name: "Sara Ahmed", type: "Annual", dates: "Nov 1 - Nov 5", role: "Store Manager" },
                { name: "Usman Tariq", type: "Casual", dates: "Oct 30", role: "QC Inspector" },
              ].map((leave, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{leave.name}</p>
                    <p className="text-xs text-muted-foreground">{leave.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{leave.type}</p>
                    <p className="text-xs text-muted-foreground mt-1">{leave.dates}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                View All Requests
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
