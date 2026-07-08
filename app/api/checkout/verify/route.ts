import { NextRequest, NextResponse } from 'next/server';
import { getOrder, updateOrderStatus } from '@/lib/db';
import { sendPaymentEmail } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const { orderId, redirectData } = await req.json();

    if (!orderId) {
      return NextResponse.json({ verified: false, error: 'orderId is required' }, { status: 400 });
    }

    const isSuccess = redirectData && redirectData.success === true;
    const txnId = redirectData?.transaction_id || 'N/A';

    let order = null;
    try {
      order = await getOrder(orderId);
    } catch (dbErr) {
      console.error('[checkout/verify] DB query error:', dbErr);
    }

    if (!order) {
      if (isSuccess) {
        order = {
          id: orderId || 'N/A',
          item_name: 'Suliman Hakimi',
          amount: 0,
          customer_name: 'Customer',
          customer_email: 'no-reply@yarpay.af',
          status: 'completed',
          hesabpay_txn_id: txnId,
        };
      } else {
        return NextResponse.json({ verified: false, error: 'Order not found' }, { status: 404 });
      }
    }

    // 1. If order is already verified and marked as completed, return success immediately.
    // This prevents sending duplicate emails on page refreshes.
    if (order.status === 'completed') {
      return NextResponse.json({ verified: true, order });
    }

    if (isSuccess) {
      // Update order status in the database if the order exists in DB
      try {
        await updateOrderStatus(orderId, 'completed', txnId);
      } catch (dbErr) {
        console.error('[checkout/verify] Failed to update order status in DB:', dbErr);
      }
      
      // Retrieve the updated order to get the latest status
      let updatedOrder = null;
      try {
        updatedOrder = await getOrder(orderId);
      } catch (dbErr) { /* ignore */ }

      const finalOrder = updatedOrder || order;

      // Send transaction details email using nodemailer
      await sendPaymentEmail({
        orderId: finalOrder.id,
        itemName: finalOrder.item_name,
        amount: finalOrder.amount,
        customerName: finalOrder.customer_name || 'Customer',
        customerEmail: finalOrder.customer_email || 'no-reply@yarpay.af',
        transactionId: txnId,
      });

      return NextResponse.json({ verified: true, order: finalOrder });
    } else {
      // Mark order as failed in database
      await updateOrderStatus(orderId, 'failed');
      return NextResponse.json({ verified: false, error: redirectData?.message || 'Payment failed or cancelled' }, { status: 400 });
    }

  } catch (err: any) {
    console.error('[checkout/verify] error:', err);
    return NextResponse.json({ verified: false, error: err?.message || 'Verification failed' }, { status: 500 });
  }
}
