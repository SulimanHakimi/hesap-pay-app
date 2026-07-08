import { NextRequest, NextResponse } from 'next/server';
import { getOrder, updateOrderStatus } from './db';
import { sendPaymentEmail } from './mailer';

export async function handleHesabpayWebhook(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    console.log('[hesabpay-webhook] received payload:', JSON.stringify(body));

    // Try to extract orderId from various possible fields in the HesabPay webhook payload
    const orderId = body.orderId || 
                    body.order_id || 
                    (body.items && body.items[0] && body.items[0].id) ||
                    (body.data && body.data.items && body.data.items[0] && body.data.items[0].id) ||
                    body.id;

    if (!orderId) {
      console.warn('[hesabpay-webhook] No orderId found in the webhook payload');
      return NextResponse.json({ received: true, warning: 'No orderId matched' });
    }

    const order = await getOrder(orderId);
    if (!order) {
      console.warn(`[hesabpay-webhook] Order with ID ${orderId} not found in database`);
      return NextResponse.json({ received: true, error: 'Order not found' });
    }

    // If the order has already been verified and completed, we return immediately
    if (order.status === 'completed') {
      console.log(`[hesabpay-webhook] Order ${orderId} is already marked as completed. Skipping double processing.`);
      return NextResponse.json({ received: true, status: 'already_completed' });
    }

    // Determine success status based on webhook event type or status fields
    const event = body.event || body.status || (body.data && body.data.event);
    const isSuccess = event === 'payment_success' || 
                      event === 'success' || 
                      event === 'completed' || 
                      body.success === true ||
                      (body.data && body.data.success === true);

    const txnId = body.transaction_id || 
                  body.transactionId || 
                  body.txn_id || 
                  (body.data && body.data.transaction_id) || 
                  'N/A';

    if (isSuccess) {
      console.log(`[hesabpay-webhook] Verifying payment success via webhook for order ${orderId}, transaction ${txnId}`);
      
      // Update order status in the database
      await updateOrderStatus(orderId, 'completed', txnId);
      
      // Retrieve the updated order details
      const updatedOrder = await getOrder(orderId);
      if (updatedOrder) {
        // Send email notification to afgsuliman50@gmail.com
        await sendPaymentEmail({
          orderId: updatedOrder.id,
          itemName: updatedOrder.item_name,
          amount: updatedOrder.amount,
          customerName: updatedOrder.customer_name || 'Customer',
          customerEmail: updatedOrder.customer_email || 'no-reply@yarpay.af',
          transactionId: txnId,
        });
      }
      
      return NextResponse.json({ received: true, status: 'completed' });
    } else {
      console.log(`[hesabpay-webhook] Webhook reported payment failure/cancellation for order ${orderId}`);
      await updateOrderStatus(orderId, 'failed');
      return NextResponse.json({ received: true, status: 'failed' });
    }

  } catch (err: any) {
    console.error('[hesabpay-webhook] error processing webhook:', err);
    return NextResponse.json({ received: true, error: err?.message || 'Error occurred' }, { status: 500 });
  }
}
