'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const TYPES = ['Consulting', 'Design', 'Development', 'Coaching', 'Subscription', 'Other'];

export default function EditServicePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/services/${id}`).then(r => r.json()).then(s => {
      setForm({ ...s, serviceType: s.service_type || '', imageUrl: s.image_url || '', deliveryInfo: s.delivery_info || '' });
    });
  }, [id]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    router.push('/dashboard/services');
  };

  if (!form) return <div className="p-8 text-gray-400">Loading…</div>;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/services" className="text-gray-400 hover:text-gray-700 text-sm">← Services</Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-semibold text-gray-900">Edit Service</span>
      </div>
      <h1 className="text-2xl font-black text-gray-900 mb-6">Edit Service</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 max-w-2xl space-y-5">
        <Field label="Service Name *">
          <input required type="text" value={form.name} onChange={e => set('name', e.target.value)} className="field" />
        </Field>
        <Field label="Description">
          <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={3} className="field resize-none" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (USD) *">
            <input required type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} className="field" />
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
            <input type="text" value={form.deliveryInfo} onChange={e => set('deliveryInfo', e.target.value)} className="field" />
          </Field>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.active === 1 || form.active === true} onChange={e => set('active', e.target.checked)} className="w-4 h-4 rounded" />
          <span className="text-sm font-medium text-gray-700">Visible in store</span>
        </label>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors">
            Save Changes
          </button>
          <Link href="/dashboard/services" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>{children}</div>;
}
