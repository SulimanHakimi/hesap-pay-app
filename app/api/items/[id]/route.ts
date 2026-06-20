import { NextRequest, NextResponse } from 'next/server';
import { findStaticProduct } from '@/lib/static-products';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = findStaticProduct(id);
  if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ...p, itemType: 'product' });
}
