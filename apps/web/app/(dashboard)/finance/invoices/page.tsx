"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Filter, FileText, CheckCircle2, AlertCircle, Clock, DownloadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/lib/api-client";

type Invoice = {
  id: string;
  client: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue" | "draft";
};

export default function FinanceInvoicesPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "overdue">("all");
  const apiClient = useApiClient();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['finance-invoices'],
    queryFn: async () => {
      const res = await apiClient.get('/finance/invoices');
      return res.data.map((inv: any) => ({
        id: inv.id,
        client: inv.tenant?.name || 'Unknown Client',
        amount: inv.total_amount,
        date: new Date(inv.issue_date || Date.now()).toLocaleDateString(),
        dueDate: new Date(inv.due_date || Date.now()).toLocaleDateString(),
        status: inv.status.toLowerCase(),
      })) as Invoice[];
    }
  });

  const filtered = (invoices || []).filter(inv => {
    const matchesSearch = inv.client.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" ? true : inv.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const totalOutstanding = (invoices || []).filter(i => i.status === "pending" || i.status === "overdue").reduce((a, b) => a + b.amount, 0);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] p-4 md:p-8 bg-slate-50/50">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Invoices</h1>
          <p className="text-slate-500 mt-1">Manage accounts receivable and billing.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
          <Button variant="outline" className="bg-white border-slate-200 text-slate-600">
            <DownloadCloud className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20">
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </motion.div>
      </div>

      {/* Summary Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0"
      >
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Total Outstanding</CardTitle>
            <div className="p-2 bg-amber-50 rounded-full"><Clock className="w-4 h-4 text-amber-600" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">Rs {(totalOutstanding / 1000).toFixed(1)}k</div>
            <p className="text-xs text-slate-500 mt-1">Across 3 invoices</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          
          {/* Tabs */}
          <div className="flex bg-slate-100/80 p-1 rounded-lg border border-slate-200">
            {(["all", "pending", "overdue"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                  activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white border-slate-200"
              />
            </div>
            <Button variant="outline" size="icon" className="bg-white text-slate-600 shrink-0">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50/30 p-4">
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-400">
                  <FileText className="w-12 h-12 mb-3 opacity-20" />
                  <p>No invoices found.</p>
                </div>
              ) : (
                filtered.map((inv, index) => (
                  <motion.div
                    key={inv.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white group">
                      <div className="flex flex-col sm:flex-row items-center p-4 gap-4">
                        <div className="flex items-center justify-center p-3 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <FileText className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900">{inv.client}</h3>
                              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{inv.id}</span>
                            </div>
                            <div className="text-sm text-slate-500 mt-1 flex gap-4">
                              <span>Issued: {inv.date}</span>
                              <span className={inv.status === 'overdue' ? 'text-red-500 font-medium' : ''}>Due: {inv.dueDate}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center sm:justify-end gap-6 w-full sm:w-auto">
                            <div className="text-right">
                              <div className="text-sm text-slate-500">Amount</div>
                              <div className="font-bold text-slate-900 text-lg tabular-nums">Rs {inv.amount.toLocaleString()}</div>
                            </div>
                            
                            <div className="w-24 text-right">
                              {inv.status === 'paid' && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shadow-none"><CheckCircle2 className="w-3 h-3 mr-1"/> Paid</Badge>}
                              {inv.status === 'pending' && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none shadow-none"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>}
                              {inv.status === 'overdue' && <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none shadow-none"><AlertCircle className="w-3 h-3 mr-1"/> Overdue</Badge>}
                              {inv.status === 'draft' && <Badge variant="outline" className="text-slate-500 border-slate-200">Draft</Badge>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
