import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // bu route Node.js ortamında çalışır (Edge değil)

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const username = String(form.get('username') ?? '');
  const password = String(form.get('password') ?? '');

  const U = process.env.ADMIN_USERNAME ?? '';
  const P = process.env.ADMIN_PASSWORD ?? '';

  const url = new URL(req.url);
  const next = url.searchParams.get('next') ?? '/admin/coins';

  if (username !== U || password !== P) {
    return NextResponse.redirect(
      new URL(`/admin/login?error=Wrong+credentials&next=${encodeURIComponent(next)}`, req.url)
    );
  }

  const isProd = process.env.NODE_ENV === 'production';
  const maxAge = 60 * 60 * 24; // 1 gün

  const res = NextResponse.redirect(new URL(next, req.url));
  res.cookies.set('admin', '1', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
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
