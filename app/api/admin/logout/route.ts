import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/admin/login', req.url));
  res.cookies.set('admin', '', { path: '/', maxAge: 0 });
  res.cookies.set('admin_name', '', { path: '/', maxAge: 0 });
  return res;
}
