"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Filter, Package, Truck, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/lib/api-client";

type Order = {
  id: string;
  client: string;
  totalAmount: number;
  date: string;
  status: "draft" | "confirmed" | "shipped" | "delivered";
  items: number;
};

export default function WholesaleOrdersPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "draft" | "confirmed" | "shipped" | "delivered">("all");
  const apiClient = useApiClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['sales-wholesale'],
    queryFn: async () => {
      // The API should ideally provide /sales/orders or similar. 
      // We assume /sales/orders?type=wholesale for this screen.
      const res = await apiClient.get('/sales/orders?type=wholesale');
      return res.data.map((order: any) => ({
        id: order.id,
        client: order.customer?.name || 'Unknown Client',
        totalAmount: order.total_amount || 0,
        date: new Date(order.created_at).toLocaleDateString(),
        status: order.status.toLowerCase(),
        items: order.order_items?.length || 0,
      })) as Order[];
    }
  });

  const filtered = (orders || []).filter(order => {
    const matchesSearch = order.client.toLowerCase().includes(search.toLowerCase()) || order.id.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" ? true : order.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] p-4 md:p-8 bg-slate-50/50 overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Wholesale Orders</h1>
          <p className="text-slate-500 mt-1">Manage bulk B2B client orders and shipments.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20">
            <Plus className="mr-2 h-4 w-4" /> Create B2B Order
          </Button>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          
          {/* Status Tabs */}
          <div className="flex bg-slate-100/80 p-1 rounded-lg border border-slate-200 overflow-x-auto w-full sm:w-auto hide-scrollbar">
            {(["all", "draft", "confirmed", "shipped", "delivered"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize whitespace-nowrap transition-colors ${
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
                placeholder="Search Client or ID..."
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
                  <Package className="w-12 h-12 mb-3 opacity-20" />
                  <p>No orders found.</p>
                </div>
              ) : (
                filtered.map((order, index) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white group">
                      <div className="flex flex-col sm:flex-row items-center p-4 gap-4">
                        <div className="flex items-center justify-center p-3 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <Package className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900 text-lg">{order.client}</h3>
                            </div>
                            <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                              <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{order.id}</span>
                              <span className="text-slate-300">•</span>
                              <span>{order.date}</span>
                              <span className="text-slate-300">•</span>
                              <span>{order.items.toLocaleString()} Units</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center sm:justify-end gap-8 w-full sm:w-auto">
                            <div className="text-right">
                              <div className="text-sm text-slate-500">Total Value</div>
                              <div className="font-bold text-slate-900 text-lg tabular-nums">Rs {(order.totalAmount / 100000).toFixed(2)} M</div>
                            </div>
                            
                            <div className="w-28 text-right flex justify-end">
                              {order.status === 'delivered' && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shadow-none"><CheckCircle2 className="w-3 h-3 mr-1"/> Delivered</Badge>}
                              {order.status === 'shipped' && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none shadow-none"><Truck className="w-3 h-3 mr-1"/> Shipped</Badge>}
                              {order.status === 'confirmed' && <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none shadow-none"><AlertCircle className="w-3 h-3 mr-1"/> Confirmed</Badge>}
                              {order.status === 'draft' && <Badge variant="outline" className="text-slate-500 border-slate-200">Draft</Badge>}
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
