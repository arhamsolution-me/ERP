'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, CalendarDays, CalendarClock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Link from "next/link";

const attendanceTrendData = [
  { date: '10/18', rate: 94 },
  { date: '10/19', rate: 92 },
  { date: '10/20', rate: 95 },
  { date: '10/21', rate: 91 },
  { date: '10/22', rate: 89 },
  { date: '10/23', rate: 96 },
  { date: '10/24', rate: 92 },
];

export default function HRDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">HR Dashboard</h1>
          <p className="text-muted-foreground">
            Headcount, attendance overview, and employee shift records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/hr/employees">
            <Button size="sm">
              Manage Staff
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
            <CardTitle className="text-sm font-medium">Payroll Cycle</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground mt-1">
              Monthly bi-weekly processing
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>
              Daily check-in percentage over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => [`${v}%`, 'Attendance Rate']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Pending Leave Requests</CardTitle>
            <CardDescription>
              Requires immediate department approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Ali Khan", type: "Sick Leave", dates: "Oct 28 - Oct 29", role: "Weaving Operator" },
                { name: "Sara Ahmed", type: "Annual Leave", dates: "Nov 1 - Nov 5", role: "Store Manager" },
                { name: "Usman Tariq", type: "Casual Leave", dates: "Oct 30", role: "QC Inspector" },
              ].map((leave, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{leave.name}</p>
                    <p className="text-xs text-muted-foreground">{leave.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">{leave.type}</p>
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
