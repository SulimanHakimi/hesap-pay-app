import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db';

export async function GET() {
  try {
    return NextResponse.json(await getProducts());
  } catch (err: any) {
    console.error('[GET /api/products]', err);
    return NextResponse.json({ error: err?.message || 'Failed to load products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    if (!body.price) body.price = 0; // price is now a suggested amount; 0 = buyer decides
    const product = await createProduct(body);
    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/products]', err);
    return NextResponse.json({ error: err?.message || 'Failed to create product' }, { status: 500 });
  }
}
