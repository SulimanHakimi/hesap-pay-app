import { NextRequest, NextResponse } from 'next/server';
import { getAllSettings, setSetting } from '@/lib/db';

export async function GET() {
  const settings = await getAllSettings();
  const safe: Record<string, string> = { ...settings };
  if (safe.hesabpay_api_key || process.env.HESABPAY_API_KEY) safe.hesabpay_api_key = '••••••••';
  return NextResponse.json(safe);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') await setSetting(key, value);
  }
  return NextResponse.json({ ok: true });
}
