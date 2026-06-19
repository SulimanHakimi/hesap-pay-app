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
  const orderId = params.get('order');
  const redirectData = parseRedirectData(params.get('data'));

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-4xl">❌</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-500 leading-relaxed mb-6">
          {redirectData?.message || 'Your payment was not completed. You have not been charged.'}
        </p>
        {orderId && (
          <p className="text-xs text-gray-400 mb-1 font-mono">Ref: {orderId}</p>
        )}
        {redirectData?.transaction_id && (
          <p className="text-xs text-gray-400 mb-6 font-mono">Txn: {redirectData.transaction_id}</p>
        )}
        <div className="flex gap-3 justify-center mt-6">
          <Link href="/store" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Try Again
          </Link>
          <Link href="/store" className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
            Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FailedPage() {
  return <Suspense fallback={null}><FailedContent /></Suspense>;
}
