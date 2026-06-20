'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function ItemPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/items/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(found => {
        if (!found || !found.id || !found.active) { setNotFound(true); return; }
        setItem(found);
        const suggested = Number(found.price);
        setAmount((Number.isFinite(suggested) && suggested > 0 ? suggested : 10).toFixed(2));
      });
  }, [id]);

  const numericAmount = Number(amount);
  const amountValid = Number.isFinite(numericAmount) && numericAmount > 0;

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!amountValid) { setError('Please enter an amount greater than 0'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, amount: numericAmount, customerEmail: email, customerName: name }),
      });
      const text = await res.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch { /* non-JSON */ }
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
      window.location.href = data.paymentUrl;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
          <h1 className="text-2xl font-black text-gray-900 mb-2">Item not available</h1>
          <p className="text-gray-500 leading-relaxed">
            This link is invalid or no longer active.
          </p>
          <p className="text-xs text-gray-400 mt-4 font-mono">Ref: {id}</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-10">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-900">Sheen Payment Gateway</h1>
          <p className="text-sm text-gray-500 mt-1.5">{item.name}</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleBuy} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full name"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (AFN)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">؋</span>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-lg font-bold text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !amountValid}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Processing…' : amountValid ? `Pay ؋${numericAmount.toFixed(2)}` : 'Pay'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">Secured by HesabPay</p>
      </div>
    </div>
  );
}
