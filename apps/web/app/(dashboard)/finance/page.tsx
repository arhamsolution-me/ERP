'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, LineChart, FileText, Landmark, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Link from "next/link";

const cashFlowData = [
  { month: 'May', inflow: 95000, outflow: 65000 },
  { month: 'Jun', inflow: 110000, outflow: 72000 },
  { month: 'Jul', inflow: 105000, outflow: 78000 },
  { month: 'Aug', inflow: 125000, outflow: 80000 },
  { month: 'Sep', inflow: 118000, outflow: 74000 },
  { month: 'Oct', inflow: 124500, outflow: 82140 },
];

export default function FinanceDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finance Dashboard</h1>
          <p className="text-muted-foreground">
            Financial health, revenue vs expenses, and bank reconciliation overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">This Month</Button>
          <Link href="/finance/invoices">
            <Button size="sm">
              Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">$124,500.00</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1 text-emerald-500" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">$82,140.50</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
              -2.4% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$42,359.50</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              Operating Margin: 34%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18,400.00</div>
            <p className="text-xs text-orange-600 flex items-center mt-1">
              3 invoices pending collection
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Cash Flow</CardTitle>
            <CardDescription>
              Monthly cash inflow vs operational outflow
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip formatter={(v, name) => [`$${v}`, name === 'inflow' ? 'Cash Inflow' : 'Cash Outflow']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="inflow" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#inflowGrad)" />
                <Area type="monotone" dataKey="outflow" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#outflowGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Bank Reconciliation</CardTitle>
            <CardDescription>
              Status of matched transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">85%</div>
                  <div className="text-sm text-muted-foreground mt-1">Transactions Reconciled</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">HBL Corporate Account</span>
                  </div>
                  <Badge variant="secondary">Matched</Badge>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Meezan Export Clearing</span>
                  </div>
                  <Badge variant="destructive">12 Pending</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Review Discrepancies
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
