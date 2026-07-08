'use client';

import { Suspense } from 'react';
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

function FailedContent() {
  const params = useSearchParams();

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

  const orderId = parsedOrderId || params.get('order');
  const redirectData = parseRedirectData(parsedRawData || params.get('data'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl border border-rose-100 shadow-2xl p-10 max-w-md w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500" />

        <h1 className="text-2xl font-black text-slate-900 mb-2">Payment Failed</h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          {redirectData?.message || 'Your payment was not completed. You have not been charged.'}
        </p>
        
        {orderId && (
          <p className="text-xs font-mono font-bold text-slate-400 mb-1">Ref: {orderId}</p>
        )}
        {redirectData?.transaction_id && (
          <p className="text-xs font-mono font-bold text-slate-400 mb-6">Txn: {redirectData.transaction_id}</p>
        )}
        
        <div className="flex gap-3 justify-center mt-6">
          <Link href="/sulimanhakimi" className="bg-[#1cb594] hover:bg-[#159e80] text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all text-center flex-1">
            Try Again
          </Link>
          <Link href="/sulimanhakimi" className="px-5 py-3 rounded-2xl text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all text-center flex-1">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FailedPage() {
  return <Suspense fallback={null}><FailedContent /></Suspense>;
}
