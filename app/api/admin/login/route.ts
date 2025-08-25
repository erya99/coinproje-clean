// app/admin/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkAdminCredentials, signAdminToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const username = String(form.get('username') || '');
  const password = String(form.get('password') || '');
  const next = String(form.get('next') || '') || '/admin/coins';

  if (!checkAdminCredentials(username, password)) {
    const url = new URL('/admin/login', req.url);
    url.searchParams.set('error', 'Invalid credentials');
    if (next) url.searchParams.set('next', next);
    return NextResponse.redirect(url);
  }

  const token = signAdminToken({ u: username });

  const url = new URL(next.startsWith('http') ? new URL(next).pathname + new URL(next).search : next, req.url);

  const res = NextResponse.redirect(url);

  // cookie domain/secure ayarları: prod’da secure + doğru domain
  const host = new URL(req.url).hostname;
  const isLocalhost = host === 'localhost' || host === '127.0.0.1';
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: !isLocalhost,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    domain: isLocalhost ? undefined : host, // ÖNEMLİ: shillvote.com’da doğru domain
  });

  return res;
}
