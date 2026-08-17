import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, ArrowRightLeft, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function InventoryDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Dashboard</h1>
          <p className="text-muted-foreground">
            Cross-warehouse stock health and movement overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/inventory/stock/transfer">
            <Button size="sm">
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              New Transfer
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">
              Across 4 categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.2M</div>
            <p className="text-xs text-muted-foreground">
              Calculated at average cost
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">14</div>
            <p className="text-xs text-muted-foreground">
              Items below reorder point
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transfers</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              In transit between warehouses
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Warehouse Stock Value</CardTitle>
            <CardDescription>
              Distribution of inventory value by location
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-slate-50 rounded-md border border-dashed">
            <div className="text-sm text-muted-foreground text-center">
              [Bar Chart Placeholder]<br/>
              Main Warehouse: $800k, Retail Hub: $300k, Outlet: $100k
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Movements</CardTitle>
            <CardDescription>
              Latest inbound and outbound transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: "IN", item: "Cotton Denim 12oz", qty: "+500", source: "Production Batch B-1042", time: "Just now" },
                { type: "OUT", item: "Premium Silk Scarf", qty: "-50", source: "Wholesale Order #412", time: "2 hours ago" },
                { type: "TRANS", item: "Basic T-Shirt", qty: "200", source: "Main to Retail Hub", time: "5 hours ago" },
              ].map((mov, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{mov.item}</p>
                    <p className="text-xs text-muted-foreground">{mov.source}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${mov.type === 'IN' ? 'text-emerald-600' : mov.type === 'OUT' ? 'text-red-600' : 'text-blue-600'}`}>
                      {mov.qty}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">{mov.time}</p>
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
