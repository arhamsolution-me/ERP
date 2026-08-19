'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  CreditCard,
  Printer,
  Loader2,
  Lock,
  Unlock,
  AlertCircle,
  User,
  PauseCircle,
  PlayCircle,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

export default function PosTerminalPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [heldCart, setHeldCart] = useState<any[] | null>(null);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Shift Gating state
  const [shiftChecking, setShiftChecking] = useState(true);
  const [hasActiveShift, setHasActiveShift] = useState(true);
  const [quickOpeningCash, setQuickOpeningCash] = useState('5000');
  const [openShiftLoading, setOpenShiftLoading] = useState(false);

  useEffect(() => {
    async function initPos() {
      try {
        setShiftChecking(true);
        // 1. Check Shift status
        const shiftRes = await fetch('/api/sales/shifts/current');
        const shiftData = await shiftRes.json();
        setHasActiveShift(Boolean(shiftData.hasActiveShift));

        // 2. Load Products with real pricing
        const prodRes = await fetch('/api/inventory/products');
        const prodData = await prodRes.json();
        if (prodData.success) {
          setProducts(prodData.products || []);
        }

        // 3. Load Customers for CRM/Wholesale tagging
        const custRes = await fetch('/api/sales/customers');
        const custData = await custRes.json();
        if (custData.success) {
          setCustomers(custData.customers || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setShiftChecking(false);
      }
    }
    initPos();
  }, []);

  async function handleQuickOpenShift(e: React.FormEvent) {
    e.preventDefault();
    setOpenShiftLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/sales/shifts/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openingCash: Number(quickOpeningCash) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to open shift');

      setHasActiveShift(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setOpenShiftLoading(false);
    }
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  function addToCart(prod: any) {
    const existingIndex = cart.findIndex((item) => item.productId === prod.id);
    const unitPrice = prod.defaultPrice || prod.unitPrice || 250;

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
          unitPrice,
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

  function handleHoldSale() {
    if (cart.length === 0) return;
    setHeldCart(cart);
    setCart([]);
  }

  function handleResumeSale() {
    if (!heldCart) return;
    setCart(heldCart);
    setHeldCart(null);
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
          customerId: selectedCustomerId || undefined,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-700 text-white rounded-xl shadow-xs">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">POS Terminal</h1>
            <p className="text-xs text-slate-500 font-medium">Fast cashier checkout & inventory deduction</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sales/history"
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Past Receipts & Refunds</span>
          </Link>

          <Link
            href="/sales/shift"
            className={`inline-flex items-center gap-1.5 font-bold text-xs px-3.5 py-2 rounded-xl transition-all border ${
              hasActiveShift
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
            }`}
          >
            {hasActiveShift ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
            <span>{hasActiveShift ? 'Shift Active' : 'Shift Closed'}</span>
          </Link>
        </div>
      </div>

      {/* POS Shift Gating Modal / Banner */}
      {!shiftChecking && !hasActiveShift && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">Register Cash Drawer is Closed</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                A register shift must be opened with a starting cash float before processing transactions.
              </p>
            </div>
          </div>

          <form onSubmit={handleQuickOpenShift} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">PKR</span>
              <input
                type="number"
                min="0"
                required
                value={quickOpeningCash}
                onChange={(e) => setQuickOpeningCash(e.target.value)}
                className="bg-white border border-amber-300 rounded-xl py-1.5 pl-10 pr-2 text-xs font-mono font-bold w-32 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={openShiftLoading}
              className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer whitespace-nowrap"
            >
              {openShiftLoading ? 'Opening...' : 'Quick Open Shift'}
            </button>
          </form>
        </div>
      )}

      {/* Success Receipt Banner */}
      {invoice && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-emerald-950">Sale Processed Successfully!</h3>
              <p className="text-xs text-emerald-700 font-mono mt-0.5">
                Receipt #{invoice.invoiceNumber} | Total: PKR {invoice.total}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={() => setInvoice(null)}
              className="bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              New Sale
            </button>
          </div>
        </div>
      )}

      {/* Main Terminal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Product Selection Grid */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search Bar & Category Filter */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product by SKU, name, or category..."
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-sky-600 shadow-xs"
            />
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map((p) => {
              const displayPrice = p.defaultPrice || p.unitPrice || 250;
              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={!hasActiveShift}
                  className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-sky-600 hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between h-32 disabled:opacity-50"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block font-mono">
                      {p.sku}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mt-0.5 group-hover:text-sky-700 transition-colors">
                      {p.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-500">{p.totalQuantity} in stock</span>
                    <span className="text-xs font-mono font-bold text-sky-700">PKR {displayPrice}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Cart, Customer Picker & Checkout */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between min-h-[520px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Current Cart ({cart.length})</span>
              </h2>

              <div className="flex items-center gap-2">
                {heldCart && (
                  <button
                    onClick={handleResumeSale}
                    className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg hover:bg-amber-100 cursor-pointer flex items-center gap-1"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Resume ({heldCart.length})</span>
                  </button>
                )}

                {cart.length > 0 && (
                  <>
                    <button
                      onClick={handleHoldSale}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Hold
                    </button>
                    <button
                      onClick={() => setCart([])}
                      className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Customer Picker */}
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/80 text-xs">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="">Walk-in Retail Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.customer_type}) {c.phone ? `— ${c.phone}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-14 text-center text-slate-400 text-xs">
                Cart is empty. Click any product from the catalog to add.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between bg-slate-50/80 p-2.5 rounded-xl border border-slate-100"
                  >
                    <div className="space-y-0.5 max-w-[170px]">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        PKR {item.unitPrice} × {item.quantity} = PKR {item.unitPrice * item.quantity}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold font-mono px-1.5">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-rose-500 hover:text-rose-700 cursor-pointer p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method & Totals */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            {/* Payment Method Selector Tabs */}
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                Payment Method
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {['cash', 'card', 'jazzcash', 'easypaisa'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-1 text-[11px] font-bold rounded-lg capitalize text-center border transition-all cursor-pointer ${
                      paymentMethod === method
                        ? 'bg-sky-700 text-white border-sky-700 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Discount field */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Discount (PKR)</span>
              <input
                type="number"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-right font-mono text-xs focus:outline-none"
              />
            </div>

            {/* Summary Totals */}
            <div className="space-y-1 text-xs text-slate-600 font-medium border-t border-slate-100 pt-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono">PKR {subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Sales Tax (17%)</span>
                <span className="font-mono">PKR {tax}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount Applied</span>
                  <span className="font-mono">-PKR {discount}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-900 font-extrabold text-base pt-1.5 border-t border-slate-200">
                <span>Grand Total</span>
                <span className="font-mono text-sky-700">PKR {total}</span>
              </div>
            </div>

            {/* Submit Charge Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || checkoutLoading || !hasActiveShift}
              className="w-full bg-sky-700 hover:bg-sky-800 text-white font-bold text-sm py-3.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Charge PKR {total}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
