'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type HesabPayRedirect = {
  success: boolean;
  message: string;
  transaction_id: string | null;
};

function parseRedirectData(raw: string | null): HesabPayRedirect | null {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get('order');
  const redirectData = parseRedirectData(params.get('data'));
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      fetch('/api/orders').then(r => r.json()).then((orders: any[]) => {
        setOrder(orders.find(o => o.id === orderId) || null);
      });
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-4xl">✅</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 leading-relaxed mb-4">
          {redirectData?.message || 'Thank you for your purchase. You should receive a confirmation shortly.'}
        </p>
        {(order || redirectData?.transaction_id) && (
          <div className="bg-gray-50 rounded-xl p-4 text-left text-sm mb-6 space-y-1.5">
            {order && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Item</span>
                  <span className="font-semibold text-gray-900">{order.item_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-semibold text-gray-900">${parseFloat(order.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-mono text-xs text-gray-600">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-semibold text-gray-900 capitalize">{order.status}</span>
                </div>
              </>
            )}
            {redirectData?.transaction_id && (
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction</span>
                <span className="font-mono text-xs text-gray-600">{redirectData.transaction_id}</span>
              </div>
            )}
          </div>
        )}
        <Link href="/store" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-block">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return <Suspense fallback={null}><SuccessContent /></Suspense>;
}
