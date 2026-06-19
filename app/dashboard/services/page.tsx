'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const load = () => fetch('/api/services').then(r => r.json()).then(setServices);
  useEffect(() => { load(); }, []);

  const toggle = async (id: string, active: boolean) => {
    await fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...services.find(s => s.id === id), active: !active }),
    });
    load();
  };

  const del = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    await fetch(`/api/services/${id}`, { method: 'DELETE' });
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
          <h1 className="text-2xl font-black text-gray-900">Services</h1>
          <p className="text-sm text-gray-500 mt-1">{services.length} total</p>
        </div>
        <Link href="/dashboard/services/new" className="bg-violet-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors shadow-sm">
          + Add Service
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <p className="font-bold text-gray-900">No services yet</p>
          <p className="text-sm text-gray-500 mt-1 mb-5">Each service gets its own shareable purchase link</p>
          <Link href="/dashboard/services/new" className="bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors">
            Add Service
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Service</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Price</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Purchase Link</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {services.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {s.image_url
                        ? <img src={s.image_url} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                        : <div className="w-10 h-10 bg-violet-50 rounded-lg flex-shrink-0" />
                      }
                      <div>
                        <p className="font-semibold text-gray-900">{s.name}</p>
                        {s.description && <p className="text-xs text-gray-400 truncate max-w-xs">{s.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-gray-900">${parseFloat(s.price).toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-mono truncate max-w-[180px]">/store/{s.id}</span>
                      <button onClick={() => copyLink(s.id)} style={{
                        background: copied === s.id ? '#7c3aed' : '#f5f3ff',
                        color: copied === s.id ? '#fff' : '#7c3aed',
                        border: 'none', borderRadius: 6, padding: '4px 10px',
                        fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                      }}>
                        {copied === s.id ? '✓ Copied' : 'Copy Link'}
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggle(s.id, !!s.active)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                        s.active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {s.active ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 justify-end">
                      <Link href={`/dashboard/services/${s.id}/edit`} className="text-xs font-medium text-violet-600 hover:underline">Edit</Link>
                      <button onClick={() => del(s.id)} className="text-xs font-medium text-red-500 hover:underline">Delete</button>
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
