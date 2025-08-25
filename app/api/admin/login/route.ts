import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // api route Node.js'ta çalışsın

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const username = String(form.get('username') ?? '');
  const password = String(form.get('password') ?? '');

  const U = process.env.ADMIN_USERNAME ?? '';
  const P = process.env.ADMIN_PASSWORD ?? '';

  const url = new URL(req.url);
  const next = url.searchParams.get('next') ?? '/admin/coins';

  if (username !== U || password !== P) {
    const res = NextResponse.redirect(new URL(`/admin/login?error=Wrong+credentials&next=${encodeURIComponent(next)}`, req.url));
    return res;
  }

  // cookie ömrü: 1 gün
  const maxAge = 60 * 60 * 24;
  const isProd = process.env.NODE_ENV === 'production';

  const res = NextResponse.redirect(new URL(next, req.url));
  res.cookies.set('admin', '1', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd, // https'te Secure
    maxAge,
  });
  res.cookies.set('admin_name', encodeURIComponent(username), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge,
  });

  return res;
}
