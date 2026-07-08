'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type HesabPayRedirect = {
  success: boolean;
  message: string;
  transaction_id: string | null;
};

function SuccessContent() {
  const params = useSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Custom robust parsing to handle both standard '&' and HesabPay's double '?' query separator formats
    const searchString = typeof window !== 'undefined' ? window.location.search : '';
    const query = searchString.startsWith('?') ? searchString.slice(1) : searchString;
    
    let parsedOrderId = '';
    let parsedRawData = '';

    const tokens = query.split(/[&?]/);
    for (const token of tokens) {
      const eqIdx = token.indexOf('=');
      if (eqIdx !== -1) {
        const key = token.substring(0, eqIdx);
        const value = token.substring(eqIdx + 1);
        if (key === 'order') {
          parsedOrderId = decodeURIComponent(value || '');
        } else if (key === 'data') {
          parsedRawData = decodeURIComponent(value || '');
        }
      }
    }

    const orderId = parsedOrderId || params.get('order') || '';
    const rawRedirectData = parsedRawData || params.get('data') || '';

    if (!orderId) {
      setError('Invalid redirect URL: order reference is missing.');
      setLoading(false);
      return;
    }

    let redirectData = null;
    if (rawRedirectData) {
      try {
        redirectData = JSON.parse(rawRedirectData);
      } catch (err) {
        console.error('Failed to parse redirect data', err);
      }
    }

    // Call backend verification API to check payment and send email
    fetch('/api/checkout/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, redirectData }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Payment verification failed.');
        }
        return data;
      })
      .then((data) => {
        setOrder(data.order);
        setVerified(true);
      })
      .catch((err: any) => {
        setError(err.message || 'We could not verify your payment with HesabPay.');
        setVerified(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-[#1cb594] rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-500">Verifying payment status with HesabPay…</p>
        </div>
      </div>
    );
  }

  if (error || !verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl border border-rose-100 shadow-2xl p-10 max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500" />

          <h1 className="text-2xl font-black text-slate-900 mb-2">Payment Verification Failed</h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-8">
            {error || 'Your payment was not completed or could not be verified. You have not been charged.'}
          </p>
          <Link href="/sulimanhakimi" className="w-full bg-[#1cb594] hover:bg-[#159e80] text-white px-6 py-3.5 rounded-2xl font-semibold transition-colors inline-block text-sm text-center">
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-10 max-w-md w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1cb594]" />
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-[#1cb594]" style={{ display: 'inline-block', transform: 'translateY(-2px)' }}>✓</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Payment Successful!</h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-6 font-medium">
          Thank you. Your payment was successfully received.
        </p>
        
        {order && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left text-sm mb-8 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Receiver</span>
              <span className="font-bold text-slate-900">{order.item_name}</span>
            </div>
            {parseFloat(order.amount) > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Amount</span>
                <span className="font-extrabold text-[#1cb594] text-base">؋{parseFloat(order.amount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Sheen Payment Id</span>
              <span className="font-mono text-[11px] text-slate-600 font-bold">{order.id}</span>
            </div>
            {order.hesabpay_txn_id && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Transaction ID</span>
                <span className="font-mono text-[11px] text-slate-600 font-bold">{order.hesabpay_txn_id}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Customer</span>
              <span className="font-bold text-slate-900 text-xs">{order.customer_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Status</span>
              <span className="font-bold text-[#1cb594] text-xs uppercase tracking-wider px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-100">Verified</span>
            </div>
          </div>
        )}
        
        <Link href="/sulimanhakimi" className="w-full bg-black hover:bg-zinc-900 text-white px-6 py-3.5 rounded-2xl font-semibold transition-colors inline-block text-sm text-center">
          Make Another Payment
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return <Suspense fallback={null}><SuccessContent /></Suspense>;
}
