export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { signAdminToken, ADMIN_COOKIE } from '@/lib/auth';

/** /admin altındaki sayfalar dışında dışarıya kaçışı engelle */
function sanitizeNext(next: string | null): string {
  if (!next) return '/admin/coins';
  if (!next.startsWith('/admin')) return '/admin/coins';
  // API'ye değil, sayfalara dönelim
  if (next.startsWith('/admin/api')) return '/admin/coins';
  return next;
}

/** Proxy arkasında da doğru origin üret */
function getOrigin(req: Request): string {
  // nginx / cloud (x-forwarded-*) başlıkları
  const xfProto = req.headers.get('x-forwarded-proto');
  const xfHost = req.headers.get('x-forwarded-host');
  if (xfHost) return `${xfProto ?? 'https'}://${xfHost}`;

  const host = req.headers.get('host') ?? 'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') ?? 'http';
  return `${proto}://${host}`;
}

export async function POST(req: Request) {
  const form = await req.formData();
  const username = String(form.get('username') ?? '');
  const password = String(form.get('password') ?? '');
  const next = sanitizeNext((new URL(req.url, getOrigin(req))).searchParams.get('next'));

  const ok =
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD;

  const origin = getOrigin(req);

  if (!ok) {
    const url = new URL('/admin/login', origin);
    url.searchParams.set('error', 'Invalid credentials');
    url.searchParams.set('next', next);
    return NextResponse.redirect(url, { status: 303 }); // 303: her zaman GET
  }

  // Token üret + cookie ayarla
  const token = signAdminToken({ u: username, ttlSeconds: 60 * 60 * 24 * 7 });
  const target = new URL(next, origin);

  const res = NextResponse.redirect(target, { status: 303 });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
