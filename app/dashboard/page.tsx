'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [orders, setOrders]     = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/services').then(r => r.json()),
      fetch('/api/orders').then(r => r.json()),
    ]).then(([p, s, o]) => { setProducts(p); setServices(s); setOrders(o); });
  }, []);

  const revenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + parseFloat(o.amount), 0);

  const stats = [
    { label: 'Products', value: products.length },
    { label: 'Services', value: services.length },
    { label: 'Orders',   value: orders.length   },
    { label: 'Revenue',  value: `$${revenue.toFixed(2)}` },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Overview</h1>
        <p className="text-gray-500 mt-1 text-sm">Your store at a glance</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{s.label}</p>
            <p className="text-3xl font-black mt-2 text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link href="/dashboard/products/new" className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:bg-blue-50 transition-all">
          <p className="font-bold text-gray-900 mb-1">Add Product</p>
          <p className="text-sm text-gray-500">Create a product and get a purchase link</p>
        </Link>
        <Link href="/dashboard/services/new" className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-violet-300 hover:bg-violet-50 transition-all">
          <p className="font-bold text-gray-900 mb-1">Add Service</p>
          <p className="text-sm text-gray-500">Create a service and get a purchase link</p>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        {orders.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">No orders yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{o.item_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{o.customer_email || 'Guest'} · {new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-900">${parseFloat(o.amount).toFixed(2)}</span>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
