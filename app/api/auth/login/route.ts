import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 min

// In-memory brute-force tracker (resets on server restart)
const attempts: Record<string, { count: number; lockedUntil: number }> = {};

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET not set');
  return new TextEncoder().encode(s);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';

  // Rate-limit check
  const now = Date.now();
  const rec = attempts[ip] ?? { count: 0, lockedUntil: 0 };
  if (rec.lockedUntil > now) {
    const wait = Math.ceil((rec.lockedUntil - now) / 60000);
    return NextResponse.json({ error: `Too many attempts. Try again in ${wait} min.` }, { status: 429 });
  }

  const { username, password } = await req.json();

  const validUser = process.env.ADMIN_USERNAME || 'admin';
  const validPass = process.env.ADMIN_PASSWORD;

  if (!validPass) {
    return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
  }

  const ok = username === validUser && password === validPass;

  if (!ok) {
    rec.count += 1;
    if (rec.count >= MAX_ATTEMPTS) {
      rec.lockedUntil = now + LOCKOUT_MS;
      rec.count = 0;
    }
    attempts[ip] = rec;
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
  }

  // Clear attempts on success
  delete attempts[ip];

  const token = await new SignJWT({ sub: username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(getSecret());

  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 hours
  });
  return res;
}
