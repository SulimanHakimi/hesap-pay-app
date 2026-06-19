import { NextRequest, NextResponse } from 'next/server';
import { getOrder, updateOrderStatus } from '@/lib/db';

// HesabPay sends one of these event names per the dashboard config:
//   payment_success   → mark order completed
//   payment_failure   → mark order failed
// Other shapes (status / success bool) are accepted as a fallback.
export async function handleHesabpayWebhook(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const eventType     = body.event || body.type || body.status;
  const hesabpayTxnId = body.transaction_id || body.transactionId || body.payment_id;
  const orderId       = body.reference || body.external_id || body.metadata?.orderId ||
    (Array.isArray(body.items) && body.items[0]?.id) || null;

  const isSuccess =
    eventType === 'payment_success' || eventType === 'COMPLETED' ||
    eventType === 'SUCCESS' || body.success === true;
  const isFailure =
    eventType === 'payment_failure' || eventType === 'FAILED' ||
    eventType === 'FAILURE' || body.success === false;

  if (!orderId) return NextResponse.json({ received: true, warning: 'No order ID found' });

  const order = await getOrder(orderId);
  if (!order) return NextResponse.json({ received: true, warning: 'Order not found' });
  if (order.status === 'completed' || order.status === 'failed') {
    return NextResponse.json({ received: true, message: 'Already processed' });
  }

  if (isSuccess) {
    await updateOrderStatus(orderId, 'completed', hesabpayTxnId);
    return NextResponse.json({ received: true, message: 'Payment confirmed' });
  }
  if (isFailure) {
    await updateOrderStatus(orderId, 'failed');
    return NextResponse.json({ received: true, message: 'Payment failure recorded' });
  }
  return NextResponse.json({ received: true, warning: `Unrecognized event: ${eventType}` });
}
