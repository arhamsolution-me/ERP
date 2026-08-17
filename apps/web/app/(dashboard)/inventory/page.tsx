'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, ArrowRightLeft, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Link from "next/link";

const warehouseDistribution = [
  { name: 'Main Warehouse', value: 800 },
  { name: 'Retail Hub', value: 300 },
  { name: 'Outlet Store', value: 100 },
];

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
              Across active categories
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
              Items below reorder threshold
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
              Distribution of inventory value by location ($ in thousands)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}k`} />
                <Tooltip formatter={(val) => [`$${val}k`, 'Stock Value']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Movements</CardTitle>
            <CardDescription>
              Latest inbound and outbound stock logs
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
