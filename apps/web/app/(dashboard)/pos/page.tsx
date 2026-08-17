"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Minus, CreditCard, Banknote, Trash2, Tag, ShoppingBag, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/lib/api-client";

type Product = { id: string; name: string; price: number; category: string };
type CartItem = Product & { quantity: number };

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const apiClient = useApiClient();

  const { data: catalog, isLoading } = useQuery({
    queryKey: ['pos-products'],
    queryFn: async () => {
      const res = await apiClient.get('/inventory/products');
      return res.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.base_price || 0,
        category: p.category || 'General',
      })) as Product[];
    }
  });

  const { data: tenantSettings } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/tenant/settings');
        return res.data;
      } catch {
        return { tax_rate: 0.16 }; // Fallback if API not found
      }
    }
  });

  const filteredCatalog = (catalog || []).filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const addToCart = (product: Product) => {
    setCart(current => {
      const existing = current.find(item => item.id === product.id);
      if (existing) {
        return current.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(current => 
      current.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  const handlePayment = (method: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      // Show success toast here in real app
    }, 1500);
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const taxRate = tenantSettings?.tax_rate || 0.16;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)] p-4 md:p-6 bg-slate-50/50">
      
      {/* Product Selection Area (Left Pane) */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="search"
              placeholder="Scan barcode or search products..."
              className="pl-10 py-6 text-lg shadow-sm border-slate-200 bg-white/80 backdrop-blur-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <Button variant="outline" className="py-6 h-auto bg-white/80 backdrop-blur-sm shadow-sm border-slate-200">
            <Tag className="mr-2 h-5 w-5 text-slate-500" />
            Custom Item
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-4 scrollbar-hide">
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredCatalog.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className="cursor-pointer overflow-hidden hover:shadow-lg transition-all border-none bg-white/80 backdrop-blur-sm active:scale-95 group"
                    onClick={() => addToCart(item)}
                  >
                    <div className={`h-32 w-full flex items-center justify-center bg-slate-100 transition-transform group-hover:scale-105`}>
                      <ShoppingBag className="w-8 h-8 text-black/10" />
                    </div>
                    <CardContent className="p-4">
                      <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">{item.category}</p>
                      <h3 className="font-semibold text-sm line-clamp-2 h-10 text-slate-800">{item.name}</h3>
                      <p className="font-bold text-blue-600 mt-2 text-lg tabular-nums">Rs {item.price.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Cart Area (Right Pane) */}
      <Card className="w-full lg:w-[420px] flex flex-col h-full shrink-0 shadow-xl border-none bg-white/90 backdrop-blur-xl overflow-hidden rounded-2xl">
        <CardHeader className="bg-slate-900 text-white p-5">
          <CardTitle className="flex justify-between items-center text-lg">
            <span>Current Sale</span>
            <span className="text-xs font-medium px-2 py-1 bg-white/20 rounded-full">Order #INV-1042</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 overflow-y-auto relative">
          <AnimatePresence>
            {cart.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {cart.map((item) => (
                  <motion.div 
                    key={item.id} 
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-4 flex gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-slate-800 line-clamp-1">{item.name}</h4>
                      <p className="text-slate-500 text-xs mt-1 tabular-nums">Rs {item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1 shadow-sm h-9">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded text-slate-500 hover:text-black hover:bg-slate-100" onClick={() => updateQuantity(item.id, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-bold w-6 text-center tabular-nums">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded text-slate-500 hover:text-black hover:bg-slate-100" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="w-20 text-right font-bold text-sm flex items-center justify-end text-slate-900 tabular-nums">
                      Rs {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-4"
              >
                <ShoppingBag className="w-16 h-16 opacity-20" />
                <p className="text-sm font-medium">Cart is empty. Scan an item.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <div className="bg-slate-50 p-5 space-y-5 border-t border-slate-200">
          <div className="space-y-2 text-sm font-medium">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="tabular-nums">Rs {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>GST ({(taxRate * 100).toFixed(0)}%)</span>
              <span className="tabular-nums">Rs {tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span>- Rs 0</span>
            </div>
            <div className="flex justify-between font-bold text-2xl pt-3 border-t border-slate-200 text-slate-900 mt-2">
              <span>Total</span>
              <span className="tabular-nums">Rs {total.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={clearCart} disabled={cart.length === 0 || isProcessing}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button variant="outline" className="h-12 bg-white" disabled={cart.length === 0 || isProcessing}>
              <Tag className="mr-2 h-4 w-4" />
              Discount
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white text-lg shadow-lg shadow-emerald-600/20"
              disabled={cart.length === 0 || isProcessing}
              onClick={() => handlePayment('cash')}
            >
              {isProcessing ? "Processing..." : <><Banknote className="mr-2 h-5 w-5" /> Cash</>}
            </Button>
            <Button 
              className="h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg shadow-lg shadow-blue-600/20"
              disabled={cart.length === 0 || isProcessing}
              onClick={() => handlePayment('card')}
            >
               {isProcessing ? "Processing..." : <><CreditCard className="mr-2 h-5 w-5" /> Card</>}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
