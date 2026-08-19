'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  DollarSign,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewWholesaleOrderPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [lines, setLines] = useState<Array<{ variantId: string; productName: string; quantity: number; unitPrice: number }>>([
    { variantId: '', productName: '', quantity: 10, unitPrice: 250 },
  ]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function initData() {
      try {
        setLoading(true);
        // 1. Fetch Customers (Wholesale)
        const custRes = await fetch('/api/sales/customers');
        const custData = await custRes.json();
        if (custData.success) {
          const wholesaleOnly = (custData.customers || []).filter((c: any) => c.customer_type === 'wholesale');
          setCustomers(wholesaleOnly.length > 0 ? wholesaleOnly : custData.customers || []);
          if (wholesaleOnly.length > 0) setSelectedCustomerId(wholesaleOnly[0].id);
        }

        // 2. Fetch Products & Variants
        const prodRes = await fetch('/api/inventory/products');
        const prodData = await prodRes.json();
        if (prodData.success) {
          setProducts(prodData.products || []);
          if (prodData.products?.length > 0 && prodData.products[0].variants?.length > 0) {
            const firstV = prodData.products[0].variants[0];
            setLines([
              {
                variantId: firstV.id,
                productName: `${prodData.products[0].name} (${firstV.size || 'Std'})`,
                quantity: 10,
                unitPrice: firstV.sellingPrice || prodData.products[0].defaultPrice || 250,
              },
            ]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  const allVariants = products.flatMap((p) =>
    (p.variants || []).map((v: any) => ({
      variantId: v.id,
      label: `${p.name} - SKU: ${p.sku} ${v.size ? `[${v.size}]` : ''} ${v.color ? `(${v.color})` : ''}`,
      defaultPrice: v.sellingPrice || p.defaultPrice || 250,
    }))
  );

  function addLine() {
    const first = allVariants[0];
    setLines([
      ...lines,
      {
        variantId: first ? first.variantId : '',
        productName: first ? first.label : '',
        quantity: 10,
        unitPrice: first ? first.defaultPrice : 250,
      },
    ]);
  }

  function updateLine(idx: number, field: string, value: any) {
    const updated = [...lines];
    const target = updated[idx];
    if (!target) return;

    if (field === 'variantId') {
      const selected = allVariants.find((v) => v.variantId === value);
      target.variantId = value;
      if (selected) {
        target.productName = selected.label;
        target.unitPrice = selected.defaultPrice;
      }
    } else if (field === 'quantity') {
      target.quantity = Math.max(1, parseInt(value || '1', 10));
    } else if (field === 'unitPrice') {
      target.unitPrice = Math.max(0, parseInt(value || '0', 10));
    }
    setLines(updated);
  }

  function removeLine(idx: number) {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== idx));
  }

  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
  const tax = Math.round(subtotal * 0.17);
  const total = subtotal + tax;

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  async function handleSubmit(asConfirmed: boolean) {
    if (!selectedCustomerId) {
      setErrorMsg('Please select a wholesale customer account');
      return;
    }

    if (lines.some((l) => !l.variantId)) {
      setErrorMsg('All line items must have a selected product');
      return;
    }

    setSubmitLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/sales/wholesale-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          status: asConfirmed ? 'confirmed' : 'draft',
          items: lines.map((l) => ({
            variantId: l.variantId,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');

      router.push('/sales/wholesale');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 font-medium">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-sky-700" />
        <span>Loading catalog and wholesale customer profiles...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/sales/wholesale"
              className="text-xs font-semibold text-sky-700 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Wholesale Orders</span>
            </Link>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Wholesale Order</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure negotiated pricing, build commercial line items, and reserve warehouse inventory.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl text-sm font-medium bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Customer Selection Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-4 h-4 text-sky-700" />
          <span>1. Customer & Account Profile</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Wholesale Client
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-600 cursor-pointer"
            >
              <option value="">Select a customer account...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.customer_type}) {c.phone ? `— ${c.phone}` : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedCustomer && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">Credit Limit Approved</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  PKR {Number(selectedCustomer.credit_limit || 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Account Status</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] uppercase">
                  Verified Wholesale
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Line Items Builder Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Boxes className="w-4 h-4 text-sky-700" />
            <span>2. Order Line Items</span>
          </h2>

          <button
            type="button"
            onClick={addLine}
            className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>
        </div>

        <div className="space-y-3">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs"
            >
              <div className="md:col-span-6">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Product Variant
                </label>
                <select
                  value={line.variantId}
                  onChange={(e) => updateLine(idx, 'variantId', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-800 focus:outline-none"
                >
                  <option value="">Choose product variant...</option>
                  {allVariants.map((v) => (
                    <option key={v.variantId} value={v.variantId}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={line.quantity}
                  onChange={(e) => updateLine(idx, 'quantity', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 focus:outline-none text-center"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Negotiated Price (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={line.unitPrice}
                  onChange={(e) => updateLine(idx, 'unitPrice', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 focus:outline-none text-right"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between pt-4 md:pt-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Line Total</span>
                  <span className="font-mono font-bold text-slate-900">
                    PKR {(line.quantity * line.unitPrice).toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => removeLine(idx)}
                  disabled={lines.length === 1}
                  className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Financial Calculation Box */}
        <div className="bg-slate-900 text-white rounded-xl p-5 space-y-2 mt-4">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Commercial Subtotal:</span>
            <span className="font-mono font-bold">PKR {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-300">
            <span>Sales Tax (17%):</span>
            <span className="font-mono font-bold">PKR {tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
            <span>Contract Total:</span>
            <span className="font-mono text-emerald-400">PKR {total.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={submitLoading}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-3 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={submitLoading}
            className="inline-flex items-center gap-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 transform hover:-translate-y-0.5"
          >
            {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>Confirm Order & Reserve Stock</span>
          </button>
        </div>
      </div>
    </div>
  );
}
