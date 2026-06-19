'use client';

import { useState } from 'react';
import Link from 'next/link';

const TYPES = ['Consulting', 'Design', 'Development', 'Coaching', 'Subscription', 'Other'];

export default function NewServicePage() {
  const [form, setForm] = useState({ name: '', description: '', price: '', serviceType: '', imageUrl: '', deliveryInfo: '', active: true });
  const [saving, setSaving] = useState(false);
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
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) setCreated({ id: data.id, name: data.name });
  };

  // ── Success screen ──
  if (created) {
    return (
      <div className="p-8 max-w-xl">
        <div style={{ background: '#faf5ff', border: '1px solid #d8b4fe', borderRadius: 20, padding: 32, textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#3b0764', margin: '0 0 6px' }}>Service created!</h2>
          <p style={{ color: '#7c3aed', fontSize: 14, margin: '0 0 28px' }}>Share this link with your customers to let them buy <strong>{created.name}</strong></p>

          <div style={{ background: '#fff', border: '1.5px solid #c4b5fd', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, textAlign: 'left' }}>
            <span style={{ flex: 1, fontSize: 13, fontFamily: 'monospace', color: '#0f172a', wordBreak: 'break-all' }}>{link}</span>
            <button onClick={copy} style={{
              flexShrink: 0, background: copied ? '#7c3aed' : '#2563eb', color: '#fff',
              border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, transition: 'background 0.2s',
            }}>
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <a href={link} target="_blank" rel="noopener noreferrer" style={{ background: '#7c3aed', color: '#fff', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              Preview Page →
            </a>
            <button onClick={() => { setCreated(null); setForm({ name: '', description: '', price: '', serviceType: '', imageUrl: '', deliveryInfo: '', active: true }); }}
              style={{ background: '#f1f5f9', color: '#475569', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
              Add Another
            </button>
            <Link href="/dashboard/services" style={{ background: '#f1f5f9', color: '#475569', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              All Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/services" className="text-gray-400 hover:text-gray-700 text-sm">← Services</Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-semibold text-gray-900">New Service</span>
      </div>
      <h1 className="text-2xl font-black text-gray-900 mb-6">Add Service</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 max-w-2xl space-y-5">
        <Field label="Service Name *">
          <input required type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. 1-Hour Consulting" className="field" />
        </Field>
        <Field label="Description">
          <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe your service…" rows={3} className="field resize-none" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (USD) *">
            <input required type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" className="field" />
          </Field>
          <Field label="Service Type">
            <select value={form.serviceType} onChange={e => set('serviceType', e.target.value)} className="field">
              <option value="">Select type…</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Image URL">
            <input type="url" value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://…" className="field" />
          </Field>
          <Field label="Delivery Info">
            <input type="text" value={form.deliveryInfo} onChange={e => set('deliveryInfo', e.target.value)} placeholder="e.g. Delivered via Zoom" className="field" />
          </Field>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} className="w-4 h-4 rounded" />
          <span className="text-sm font-medium text-gray-700">Visible in store</span>
        </label>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-violet-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : 'Save & Get Link'}
          </button>
          <Link href="/dashboard/services" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>{children}</div>;
}
