export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { makeAdminToken } from '@/lib/auth';

function sanitizeNext(next: string | null): string {
  if (!next || !next.startsWith('/admin')) return '/admin/coins';
  if (next.startsWith('/admin/api')) return '/admin/coins';
  return next;
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const username = String(form.get('username') ?? '');
  const password = String(form.get('password') ?? '');
  const next = sanitizeNext((form.get('next') as string) || req.nextUrl.searchParams.get('next'));

  const ok =
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD;

  const url = req.nextUrl.clone();

  if (!ok) {
    url.pathname = '/admin/login';
    url.searchParams.set('error', 'Invalid credentials');
    url.searchParams.set('next', next);
    return NextResponse.redirect(url, { status: 303 });
  }

  // başarılı -> cookie yaz ve admin/coins’e gönder
  const token = makeAdminToken();
  const res = NextResponse.redirect(new URL(next, req.nextUrl), { status: 303 });
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 gün
  });
  return res;
}
