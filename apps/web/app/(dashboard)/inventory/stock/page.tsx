"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Filter, Package, ArrowRightLeft, ArrowDownToLine, MoreHorizontal, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/lib/api-client";

type StockItem = {
  id: string;
  product: { name: string; category: string; sku: string };
  warehouse: { name: string };
  quantity: number;
  min_stock_level: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
};

export default function InventoryStockPage() {
  const [search, setSearch] = useState("");
  const apiClient = useApiClient();

  const { data: stockItems, isLoading, error } = useQuery({
    queryKey: ['inventory-stock'],
    queryFn: async () => {
      const res = await apiClient.get('/inventory/stock');
      // Map backend data to UI format
      return res.data.map((item: any) => ({
        id: item.id,
        product: { name: item.product_variant?.product?.name || 'Unknown', category: item.product_variant?.product?.category || 'General', sku: item.product_variant?.sku || 'N/A' },
        warehouse: { name: item.warehouse?.name || 'Main Warehouse' },
        quantity: item.quantity,
        min_stock_level: item.min_stock_level,
        status: item.quantity === 0 ? "out_of_stock" : item.quantity <= item.min_stock_level ? "low_stock" : "in_stock"
      })) as StockItem[];
    }
  });

  const filteredStock = (stockItems || []).filter(item => 
    item.product.name.toLowerCase().includes(search.toLowerCase()) || 
    item.product.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] p-4 md:p-8 bg-slate-50/50 overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 shrink-0">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Stock Levels</h1>
          <p className="text-slate-500 mt-1">Real-time inventory across all warehouses and branches.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="bg-white border-slate-200">
            <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer
          </Button>
          <Button variant="outline" className="bg-white border-slate-200">
            <ArrowDownToLine className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20">
            <Plus className="mr-2 h-4 w-4" /> Receive Stock
          </Button>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden"
      >
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by SKU or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-slate-200 shadow-sm"
            />
          </div>
          <Button variant="outline" size="sm" className="bg-white">
            <Filter className="mr-2 h-4 w-4" /> Filter by Warehouse
          </Button>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <TableRow className="border-slate-100">
                <TableHead className="font-semibold text-slate-600">SKU</TableHead>
                <TableHead className="font-semibold text-slate-600">Product Name</TableHead>
                <TableHead className="font-semibold text-slate-600">Location</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">On Hand</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Reserved</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Available</TableHead>
                <TableHead className="text-center font-semibold text-slate-600">Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStock.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-64 text-center text-slate-500">
                    No stock items found matching "{search}"
                  </TableCell>
                </TableRow>
              ) : (
                filteredStock.map((item, index) => {
                  const qtyReserved = 0; // Temporarily 0 until reservations feature is added to API
                  const available = item.quantity - qtyReserved;
                  return (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-slate-100 hover:bg-slate-50/80 transition-colors group"
                    >
                      <TableCell className="font-medium text-slate-900">{item.product.sku}</TableCell>
                      <TableCell className="text-slate-600">{item.product.name}</TableCell>
                      <TableCell className="text-slate-500">{item.warehouse.name}</TableCell>
                      <TableCell className="text-right tabular-nums text-slate-900 font-medium">{item.quantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums text-slate-500">{qtyReserved.toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums font-bold text-blue-600">{available.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        {item.status === "in_stock" ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">In Stock</Badge>
                        ) : item.status === "low_stock" ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1 mx-auto w-fit">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Out of Stock</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4 text-slate-400" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </div>
  );
}
