import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET not set');
  return new TextEncoder().encode(s);
}

// These API routes are public — needed for the /store/[id] purchase pages
const PUBLIC_API = [
  '/api/checkout',   // POST to create HesabPay session
  '/api/webhook',    // POST from HesabPay after payment
  '/api/auth',       // POST login / logout
];

// Public GET endpoints — no auth required.
// Products and services (list + single item) are catalog data; the store is public.
// /api/settings is public too because the API key is masked in the response.
// /api/orders stays protected — it leaks customer info. All writes stay protected.
function isPublicItemRoute(pathname: string, method: string): boolean {
  if (method !== 'GET') return false;
  if (pathname === '/api/settings') return true;
  if (/^\/api\/products(\/[^/]+)?$/.test(pathname)) return true;
  if (/^\/api\/services(\/[^/]+)?$/.test(pathname)) return true;
  if (/^\/api\/items\/[^/]+$/.test(pathname)) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isDashboard    = pathname.startsWith('/dashboard');
  const isProtectedApi = pathname.startsWith('/api/') &&
    !PUBLIC_API.some(p => pathname.startsWith(p)) &&
    !isPublicItemRoute(pathname, req.method);

  // Not a protected route — let through
  if (!isDashboard && !isProtectedApi) return NextResponse.next();

  const token = req.cookies.get('admin_token')?.value;

  if (!token) {
    if (isProtectedApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    // Invalid / expired token
    if (isProtectedApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    const res = NextResponse.redirect(url);
    res.cookies.set('admin_token', '', { httpOnly: true, maxAge: 0, path: '/' });
    return res;
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
