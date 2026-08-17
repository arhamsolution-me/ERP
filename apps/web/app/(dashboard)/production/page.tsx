import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Activity, AlertCircle, Settings2, BarChart3, Clock } from "lucide-react";
import Link from "next/link";

export default function ProductionDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Production Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of mill activity, machine status, and active batches.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date Range Placeholder */}
          <Button variant="outline" size="sm">Today</Button>
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
        {/* Stage Distribution (Placeholder for Donut Chart) */}
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Stage Distribution</CardTitle>
            <CardDescription>
              Active batches across production stages
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-slate-50 rounded-md border border-dashed">
            <div className="text-sm text-muted-foreground text-center">
              [Donut Chart Placeholder]<br/>
              Spinning: 5, Weaving: 8, Dyeing: 6, Finishing: 3, QC: 2
            </div>
          </CardContent>
        </Card>

        {/* Recent Downtime Alerts */}
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Downtime Alerts</CardTitle>
            <CardDescription>
              Machine stops requiring attention
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
