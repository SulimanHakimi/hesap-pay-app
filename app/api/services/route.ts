import { NextRequest, NextResponse } from 'next/server';
import { getServices, createService } from '@/lib/db';

export async function GET() {
  return NextResponse.json(await getServices());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name || !body.price) {
    return NextResponse.json({ error: 'name and price are required' }, { status: 400 });
  }
  const service = await createService(body);
  return NextResponse.json(service, { status: 201 });
}
