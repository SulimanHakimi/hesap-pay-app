import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db';

export async function GET() {
  return NextResponse.json(await getProducts());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name || !body.price) {
    return NextResponse.json({ error: 'name and price are required' }, { status: 400 });
  }
  const product = await createProduct(body);
  return NextResponse.json(product, { status: 201 });
}
