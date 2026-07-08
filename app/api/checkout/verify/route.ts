import { NextRequest, NextResponse } from 'next/server';
import { getOrder, updateOrderStatus } from '@/lib/db';
import { sendPaymentEmail } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const { orderId, redirectData } = await req.json();

    if (!orderId) {
      return NextResponse.json({ verified: false, error: 'orderId is required' }, { status: 400 });
    }

    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json({ verified: false, error: 'Order not found' }, { status: 404 });
    }

    // 1. If order is already verified and marked as completed, return success immediately.
    // This prevents sending duplicate emails on page refreshes.
    if (order.status === 'completed') {
      return NextResponse.json({ verified: true, order });
    }

    // 2. Check if payment is successful based on HesabPay redirect data
    const isSuccess = redirectData && redirectData.success === true;

    if (isSuccess) {
      const txnId = redirectData.transaction_id || 'N/A';
      
      // Update order status in the database to completed
      await updateOrderStatus(orderId, 'completed', txnId);
      
      // Retrieve the updated order to get the latest status
      const updatedOrder = await getOrder(orderId);
      if (!updatedOrder) {
        return NextResponse.json({ verified: false, error: 'Failed to retrieve updated order' }, { status: 500 });
      }

      // Send transaction details email using nodemailer
      await sendPaymentEmail({
        orderId: updatedOrder.id,
        itemName: updatedOrder.item_name,
        amount: updatedOrder.amount,
        customerName: updatedOrder.customer_name || 'Customer',
        customerEmail: updatedOrder.customer_email || 'no-reply@yarpay.af',
        transactionId: txnId,
      });

      return NextResponse.json({ verified: true, order: updatedOrder });
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
