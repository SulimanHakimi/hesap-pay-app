import { NextRequest, NextResponse } from 'next/server';

// Static-products mode: we don't persist orders, so the webhook just logs
// the event and returns 200 so HesabPay stops retrying. The user-facing
// success/failure pages are driven by HesabPay's redirect (with ?data=...),
// which is already authoritative for displaying the result.
export async function handleHesabpayWebhook(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  console.log('[hesabpay-webhook]', JSON.stringify(body));
  return NextResponse.json({ received: true });
}
