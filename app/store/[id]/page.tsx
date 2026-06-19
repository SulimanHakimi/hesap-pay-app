'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ItemPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<any>(null);
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Sheen Store';
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/items/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(found => {
        if (!found || !found.id || !found.active) { setNotFound(true); return; }
        setItem(found);
      });
  }, [id]);

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, customerEmail: email, customerName: name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
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
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-4xl">🔍</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Item not available</h1>
          <p className="text-gray-500 leading-relaxed">
            This product or service may have been removed, or the link is incorrect.
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

  const isService = item.itemType === 'service';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">HP</span>
            </div>
            <Link href="/store" className="font-bold text-gray-900 text-lg hover:text-blue-600 transition-colors">{storeName}</Link>
          </div>
          <Link href="/store" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors">
            ← Back to store
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="relative h-72 bg-gradient-to-br from-slate-100 to-slate-200">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">
                    {isService ? '⚡' : '📦'}
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    isService ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {isService ? 'Service' : 'Product'}
                  </span>
                  {(item.category || item.service_type) && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{item.category || item.service_type}</span>
                  )}
                </div>
                <h1 className="text-2xl font-black text-gray-900">{item.name}</h1>
                {item.description && (
                  <p className="text-gray-600 mt-3 leading-relaxed text-base">{item.description}</p>
                )}
                {item.delivery_info && (
                  <div className="mt-4 flex items-start gap-2.5 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
                    <span className="text-base">📬</span>
                    <span>{item.delivery_info}</span>
                  </div>
                )}
                {item.stock > 0 && (
                  <p className="mt-3 text-sm text-emerald-600 font-medium">✓ {item.stock} in stock</p>
                )}
              </div>
            </div>
          </div>

          {/* Right — purchase */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6">
              <div className="flex items-end justify-between pb-5 border-b border-gray-100 mb-5">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Price</p>
                  <p className="text-4xl font-black text-gray-900 mt-1">${parseFloat(item.price).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Paid via</p>
                  <p className="text-sm font-bold text-blue-600">HesabPay</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                  ⚠ {error}
                </div>
              )}

              <form onSubmit={handleBuy} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1">Sent to your email after purchase</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2.5 shadow-sm"
                >
                  {loading ? (
                    <span className="inline-block animate-spin text-lg">⟳</span>
                  ) : (
                    <>🔒 Pay ${parseFloat(item.price).toFixed(2)} with HesabPay</>
                  )}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-center gap-5 text-xs text-gray-400">
                <span>🔒 SSL Secured</span>
                <span>✓ HesabPay</span>
                <span>🌍 AFN</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
