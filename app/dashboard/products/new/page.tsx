'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function NewProductPage() {
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', imageUrl: '', stock: '', active: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<{ id: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const link = created ? `${window.location.origin}/store/${created.id}` : '';

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, stock: form.stock ? parseInt(form.stock) : -1 }),
      });
      const text = await res.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch { /* non-JSON */ }
      if (!res.ok) {
        setError(data?.error || `Request failed (${res.status}): ${text.slice(0, 200) || 'no body'}`);
        return;
      }
      if (data?.id) setCreated({ id: data.id, name: data.name });
      else setError('Server returned no product data');
    } catch (err: any) {
      setError(err?.message || 'Network error');
    } finally {
      setSaving(false);
    }
  };

  // ── Success screen ──
  if (created) {
    return (
      <div className="p-8 max-w-xl">
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: 32, textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#14532d', margin: '0 0 6px' }}>Product created!</h2>
          <p style={{ color: '#16a34a', fontSize: 14, margin: '0 0 28px' }}>Share this link with your customers to let them buy <strong>{created.name}</strong></p>

          {/* Link box */}
          <div style={{ background: '#fff', border: '1.5px solid #86efac', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, textAlign: 'left' }}>
            <span style={{ flex: 1, fontSize: 13, fontFamily: 'monospace', color: '#0f172a', wordBreak: 'break-all' }}>{link}</span>
            <button onClick={copy} style={{
              flexShrink: 0, background: copied ? '#16a34a' : '#2563eb', color: '#fff',
              border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, transition: 'background 0.2s',
            }}>
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <a href={link} target="_blank" rel="noopener noreferrer" style={{ background: '#2563eb', color: '#fff', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              Preview Page →
            </a>
            <button onClick={() => { setCreated(null); setForm({ name: '', description: '', price: '', category: '', imageUrl: '', stock: '', active: true }); }}
              style={{ background: '#f1f5f9', color: '#475569', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
              Add Another
            </button>
            <Link href="/dashboard/products" style={{ background: '#f1f5f9', color: '#475569', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              All Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/products" className="text-gray-400 hover:text-gray-700 text-sm">← Products</Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-semibold text-gray-900">New Product</span>
      </div>
      <h1 className="text-2xl font-black text-gray-900 mb-6">Add Product</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 max-w-2xl space-y-5">
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
            ⚠ {error}
          </div>
        )}
        <Field label="Product Name *">
          <input required type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Wireless Headphones" className="field" />
        </Field>
        <Field label="Description">
          <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe your product…" rows={3} className="field resize-none" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Suggested amount (AFN, optional)">
            <input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="Buyer chooses if blank" className="field" />
          </Field>
          <Field label="Category">
            <input type="text" value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. Electronics" className="field" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Image URL">
            <input type="url" value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://…" className="field" />
          </Field>
          <Field label="Stock (blank = unlimited)">
            <input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="∞" className="field" />
          </Field>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} className="w-4 h-4 rounded" />
          <span className="text-sm font-medium text-gray-700">Visible in store</span>
        </label>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : 'Save & Get Link'}
          </button>
          <Link href="/dashboard/products" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>{children}</div>;
}
