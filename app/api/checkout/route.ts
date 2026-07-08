import { NextRequest, NextResponse } from 'next/server';
import { findStaticProduct } from '@/lib/static-products';
import { createOrder } from '@/lib/db';

const HESABPAY_BASE = 'https://api.hesab.com/api/v1';

function genOrderId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export async function POST(req: NextRequest) {
  try {
    const { itemId, amount, customerEmail, customerName } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Please enter a valid amount greater than 0' }, { status: 400 });
    }

    const item = findStaticProduct(itemId);
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    if (!item.active) return NextResponse.json({ error: 'This item is not available' }, { status: 400 });

    const apiKey = process.env.HESABPAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'HESABPAY_API_KEY is not configured in the environment variables' }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shop.sheen.af';

    // Create the order in database to track status and customer details securely
    const order = await createOrder({
      itemId: item.id,
      itemType: 'product',
      itemName: item.name,
      amount: numericAmount,
      customerEmail: customerEmail || '',
      customerName: customerName || '',
    });

    if (!order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    const orderId = order.id;

    const payload = {
      email: customerEmail || undefined,
      items: [{ id: orderId, name: item.name, price: numericAmount }],
      redirect_success_url: `${baseUrl}/checkout/success?order=${orderId}`,
      redirect_failure_url: `${baseUrl}/checkout/failed?order=${orderId}`,
    };

    const res = await fetch(`${HESABPAY_BASE}/payment/create-session`, {
      method: 'POST',
      headers: {
        'Authorization': `API-KEY ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const rawBody = await res.text();
    let data: any = {};
    try { data = JSON.parse(rawBody); } catch { /* non-JSON */ }

    if (!res.ok) {
      console.error('[checkout] HesabPay error', { status: res.status, body: rawBody });
      return NextResponse.json({ error: data?.message || `HesabPay error ${res.status}: ${rawBody.slice(0, 300)}` }, { status: 502 });
    }

    const paymentUrl = data?.url || data?.payment_url || data?.paymentUrl || data?.checkoutUrl;
    if (!paymentUrl) {
      console.error('[checkout] HesabPay response missing payment_url', { status: res.status, body: rawBody });
      return NextResponse.json({
        error: `HesabPay did not return a payment URL. Response: ${rawBody.slice(0, 500)}`,
        upstream: data,
      }, { status: 502 });
    }

    return NextResponse.json({ success: true, paymentUrl, orderId });
  } catch (err: any) {
    console.error('[checkout] uncaught', err);
    return NextResponse.json({ error: err?.message || 'Checkout failed' }, { status: 500 });
  }
}
