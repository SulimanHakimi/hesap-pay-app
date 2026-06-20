import { NextRequest, NextResponse } from 'next/server';
import { getServices, createService } from '@/lib/db';

export async function GET() {
  try {
    return NextResponse.json(await getServices());
  } catch (err: any) {
    console.error('[GET /api/services]', err);
    return NextResponse.json({ error: err?.message || 'Failed to load services' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    if (!body.price) body.price = 0; // price is now a suggested amount; 0 = buyer decides
    const service = await createService(body);
    return NextResponse.json(service, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/services]', err);
    return NextResponse.json({ error: err?.message || 'Failed to create service' }, { status: 500 });
  }
}
