import { NextRequest } from 'next/server';
import { handleHesabpayWebhook } from '@/lib/hesabpay-webhook';

export async function POST(req: NextRequest) {
  return handleHesabpayWebhook(req);
}
