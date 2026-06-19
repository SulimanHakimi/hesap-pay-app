'use client';

import { useState, useEffect } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(setOrders);
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const revenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + parseFloat(o.amount), 0);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">
          {orders.filter(o => o.status === 'completed').length} completed · ${revenue.toFixed(2)} total revenue
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5">
        {['all', 'pending', 'completed', 'failed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors capitalize ${
              filter === s ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center text-gray-400 text-sm">
          No {filter === 'all' ? '' : filter} orders yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Order</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Customer</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Amount</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900">{o.item_name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{o.id}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-gray-700">{o.customer_name || '—'}</p>
                    <p className="text-xs text-gray-400">{o.customer_email || 'No email'}</p>
                  </td>
                  <td className="px-5 py-4 font-bold text-gray-900">${parseFloat(o.amount).toFixed(2)}</td>
                  <td className="px-5 py-4"><StatusBadge status={o.status} /></td>
                  <td className="px-5 py-4 text-gray-500 text-xs">{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: 'bg-emerald-100 text-emerald-700',
    pending:   'bg-amber-100 text-amber-700',
    failed:    'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}
