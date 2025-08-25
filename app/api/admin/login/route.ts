export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { signAdminToken } from '@/lib/auth';

function sanitizeNext(next: string | null): string {
  if (!next || !next.startsWith('/admin')) return '/admin/coins';
  if (next.startsWith('/admin/api')) return '/admin/coins';
  return next;
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const username = String(form.get('username') ?? '');
  const password = String(form.get('password') ?? '');
  const next = sanitizeNext(
    (form.get('next') as string) || req.nextUrl.searchParams.get('next')
  );

  const ok =
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD;

  if (!ok) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('error', 'Invalid credentials');
    url.searchParams.set('next', next);
    return NextResponse.redirect(url, { status: 303 }); // 303: her zaman GET
  }

  const token = signAdminToken({ sub: username });

  const res = NextResponse.redirect(new URL(next, req.url), { status: 303 });
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 gün
  });
  return res;
}
