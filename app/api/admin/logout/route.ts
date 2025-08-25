// app/admin/api/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/admin/login', req.url));
  const host = new URL(req.url).hostname;
  const isLocalhost = host === 'localhost' || host === '127.0.0.1';
  res.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: !isLocalhost,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    domain: isLocalhost ? undefined : host,
  });
  return res;
}
