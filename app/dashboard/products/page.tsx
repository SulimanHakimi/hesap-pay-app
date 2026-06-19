'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const load = () => fetch('/api/products').then(r => r.json()).then(setProducts);
  useEffect(() => { load(); }, []);

  const toggle = async (id: string, active: boolean) => {
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...products.find(p => p.id === id), active: !active }),
    });
    load();
  };

  const del = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    load();
  };

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/store/${id}`);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} total</p>
        </div>
        <Link href="/dashboard/products/new" className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <p className="font-bold text-gray-900">No products yet</p>
          <p className="text-sm text-gray-500 mt-1 mb-5">Each product gets its own shareable purchase link</p>
          <Link href="/dashboard/products/new" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
            Add Product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Product</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Price</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Purchase Link</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {p.image_url
                        ? <img src={p.image_url} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                        : <div className="w-10 h-10 bg-blue-50 rounded-lg flex-shrink-0" />
                      }
                      <div>
                        <p className="font-semibold text-gray-900">{p.name}</p>
                        {p.description && <p className="text-xs text-gray-400 truncate max-w-xs">{p.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-gray-900">${parseFloat(p.price).toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-mono truncate max-w-[180px]">/store/{p.id}</span>
                      <button onClick={() => copyLink(p.id)} style={{
                        background: copied === p.id ? '#16a34a' : '#eff6ff',
                        color: copied === p.id ? '#fff' : '#2563eb',
                        border: 'none', borderRadius: 6, padding: '4px 10px',
                        fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                      }}>
                        {copied === p.id ? '✓ Copied' : 'Copy Link'}
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggle(p.id, !!p.active)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                        p.active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {p.active ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 justify-end">
                      <Link href={`/dashboard/products/${p.id}/edit`} className="text-xs font-medium text-blue-600 hover:underline">Edit</Link>
                      <button onClick={() => del(p.id)} className="text-xs font-medium text-red-500 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
