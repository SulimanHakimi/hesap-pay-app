import { NextRequest, NextResponse } from 'next/server';
import { getItem, createOrder, getSetting } from '@/lib/db';

const HESABPAY_BASE_DEFAULT = 'https://api.hesab.com/api/v1';
const HESABPAY_API_KEY_FALLBACK = 'ZTRiMGM3YTUtNWU0MC00NzgxLWE3YmQtODE3NDZkMzc0NjExX19iMTdhNDhhZDZjZTk0NzNmZjE3MA==';

async function resolveHesabpayBase() {
  const override = process.env.HESABPAY_API_BASE || await getSetting('hesabpay_api_base');
  return (override || HESABPAY_BASE_DEFAULT).replace(/\/$/, '');
}

export async function POST(req: NextRequest) {
  try {
    const { itemId, customerEmail, customerName } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
    }

    const apiKey = process.env.HESABPAY_API_KEY || await getSetting('hesabpay_api_key') || HESABPAY_API_KEY_FALLBACK;

    const item = await getItem(itemId);
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    if (!item.active) return NextResponse.json({ error: 'This item is not available' }, { status: 400 });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || await getSetting('store_url') || 'https://shop.sheen.af';

    const order = await createOrder({
      itemId: item.id,
      itemType: item.itemType,
      itemName: item.name,
      amount: item.price,
      customerEmail: customerEmail || null,
      customerName: customerName || null,
    });
    if (!order) return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });

    // HesabPay expects numeric price; Postgres NUMERIC returns a string, so coerce.
    const numericPrice = Number(item.price);
    if (!Number.isFinite(numericPrice)) {
      return NextResponse.json({ error: `Invalid item price: ${item.price}` }, { status: 500 });
    }

    const payload = {
      email: customerEmail || undefined,
      items: [{ id: order.id, name: item.name, price: numericPrice }],
      redirect_success_url: `${baseUrl}/checkout/success?order=${order.id}`,
      redirect_failure_url: `${baseUrl}/checkout/failed?order=${order.id}`,
    };

    const HESABPAY_BASE = await resolveHesabpayBase();

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

    const paymentUrl = data?.payment_url || data?.paymentUrl || data?.checkoutUrl;
    if (!paymentUrl) {
      console.error('[checkout] HesabPay response missing payment_url', data);
      return NextResponse.json({ error: 'HesabPay did not return a payment URL.', upstream: data }, { status: 502 });
    }

    return NextResponse.json({ success: true, paymentUrl, orderId: order.id });
  } catch (err: any) {
    console.error('[checkout] uncaught', err);
    return NextResponse.json({ error: err?.message || 'Checkout failed', stack: err?.stack?.split('\n').slice(0, 5).join('\n') }, { status: 500 });
  }
}
