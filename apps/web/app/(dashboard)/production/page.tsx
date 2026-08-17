'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Activity, AlertCircle, Settings2, BarChart3, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Link from "next/link";

const stageDistributionData = [
  { stage: 'Spinning', count: 5 },
  { stage: 'Weaving', count: 8 },
  { stage: 'Dyeing', count: 6 },
  { stage: 'Finishing', count: 3 },
  { stage: 'QC Pass', count: 2 },
];

export default function ProductionDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Production Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of mill activity, machine status, and active manufacturing batches.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Current Shift</Button>
          <Link href="/production/batches/new">
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Batch
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +3 since last shift
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wastage %</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">4.2%</div>
            <p className="text-xs text-muted-foreground">
              +0.5% above threshold
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Machine Uptime</CardTitle>
            <Settings2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.4%</div>
            <p className="text-xs text-muted-foreground">
              2 machines currently down
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QC Pass Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.8%</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days average
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Stage Distribution Chart */}
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Stage Distribution</CardTitle>
            <CardDescription>
              Active batches currently in processing stages
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageDistributionData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="stage" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip formatter={(val) => [`${val} Batches`, 'In Stage']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Downtime Alerts */}
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Downtime Alerts</CardTitle>
            <CardDescription>
              Machine stops requiring operator attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { machine: "Loom A-4", reason: "Yarn Breakage", time: "10 mins ago", status: "Investigating" },
                { machine: "Dyeing Vat 2", reason: "Temperature Fault", time: "1 hour ago", status: "Resolved" },
                { machine: "Spinner 12", reason: "Scheduled Maintenance", time: "3 hours ago", status: "In Progress" },
              ].map((alert, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <Clock className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{alert.machine}</p>
                      <p className="text-xs text-muted-foreground">{alert.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={alert.status === "Resolved" ? "outline" : "secondary"}>
                      {alert.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
