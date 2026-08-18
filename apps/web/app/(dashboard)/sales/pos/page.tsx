'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Plus, Minus, Trash2, CheckCircle2, CreditCard, Printer, Loader2 } from 'lucide-react';

export default function PosTerminalPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/inventory/products');
        const data = await res.json();
        if (data.success) {
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  function addToCart(prod: any) {
    const existingIndex = cart.findIndex((item) => item.productId === prod.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          productId: prod.id,
          name: prod.name,
          sku: prod.sku,
          unitPrice: 100, // Standard price
          quantity: 1,
          unit: prod.unit,
        },
      ]);
    }
  }

  function updateQuantity(productId: string, delta: number) {
    setCart(
      cart
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  }

  function removeFromCart(productId: string) {
    setCart(cart.filter((item) => item.productId !== productId));
  }

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discount = parseInt(discountAmount || '0', 10);
  const tax = Math.round(subtotal * 0.17); // 17% tax
  const total = Math.max(0, subtotal + tax - discount);

  async function handleCheckout() {
    if (cart.length === 0) return;
    setCheckoutLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/sales/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          paymentMethod,
          discountAmount: discount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');

      setInvoice(data);
      setCart([]);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-2 font-sans space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-700 text-white rounded-xl shadow-xs">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">POS Terminal</h1>
            <p className="text-xs text-slate-500 font-medium">Fast cashier checkout & inventory deduction</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Selection Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product by SKU or Name..."
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-sky-600 shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-sky-600 hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between h-32"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block font-mono">{p.sku}</span>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mt-0.5 group-hover:text-sky-700 transition-colors">{p.name}</h3>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-500">{p.totalQuantity} in stock</span>
                  <span className="text-xs font-bold text-sky-700">PKR 100</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Cart & Summary */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between min-h-[500px]">
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Current Order Cart ({cart.length})</span>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="text-xs text-rose-600 font-bold hover:underline cursor-pointer">
                  Clear All
                </button>
              )}
            </h2>

            {errorMsg && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">{errorMsg}</div>}

            {cart.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">Cart is empty. Click a product to add.</div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">PKR {item.unitPrice} each</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                        <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 text-slate-500 hover:text-slate-900">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold font-mono px-2">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 text-slate-500 hover:text-slate-900">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button onClick={() => removeFromCart(item.productId)} className="text-rose-500 hover:text-rose-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Totals & Submit */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="space-y-1.5 text-xs text-slate-600 font-medium">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono">PKR {subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (17%)</span>
                <span className="font-mono">PKR {tax}</span>
              </div>
              <div className="flex justify-between items-center text-slate-900 font-extrabold text-base pt-2 border-t border-slate-200">
                <span>Grand Total</span>
                <span className="font-mono text-sky-700">PKR {total}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkoutLoading || cart.length === 0}
              className="w-full bg-sky-700 hover:bg-sky-800 text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {checkoutLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
              <span>Complete Sale & Deduct Stock</span>
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Receipt Modal */}
      {invoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4 shadow-xl animate-fadeIn text-center">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-slate-900">Sale Completed!</h3>
            <p className="text-xs text-slate-500 font-medium">Stock levels updated & movement logged</p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-left font-mono text-xs text-slate-800">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Invoice #</span>
                <span>{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>PKR {invoice.subtotal}</span>
              </div>
              <div className="flex justify-between font-bold text-sky-700 text-sm pt-2 border-t border-slate-200">
                <span>Total Paid</span>
                <span>PKR {invoice.total}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setInvoice(null)}
                className="flex-1 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs py-3 rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
