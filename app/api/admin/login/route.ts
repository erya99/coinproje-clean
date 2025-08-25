export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { signAdminToken } from '@/lib/auth';

// login sonrası gidilecek sayfayı temizle
function sanitizeNext(next: string | null): string {
  if (!next || !next.startsWith('/admin')) return '/admin/coins';
  if (next.startsWith('/admin/api')) return '/admin/coins';
  return next;
}

export async function POST(req: Request) {
  const form = await req.formData();
  const username = String(form.get('username') ?? '');
  const password = String(form.get('password') ?? '');
  const next = sanitizeNext(new URL(req.url).searchParams.get('next'));

  const ok =
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD;

  const url = new URL(req.url);

  if (!ok) {
    url.pathname = '/admin/login';
    url.searchParams.set('error', 'Invalid credentials');
    url.searchParams.set('next', next);
    return NextResponse.redirect(url, { status: 303 });
  }

  const token = signAdminToken({ u: username });

  const res = NextResponse.redirect(new URL(next, req.url), { status: 303 });
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',           // tüm sitede geçerli olsun
    maxAge: 60 * 60 * 24 * 7, // 7 gün
  });
  return res;
}
