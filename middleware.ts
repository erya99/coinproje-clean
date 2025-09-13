import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const isAdmin = url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login');
  if (!isAdmin) return NextResponse.next();

  const ok = req.cookies.get('admin_auth')?.value === 'ok';
  if (ok) return NextResponse.next();

  url.pathname = '/admin/login';
  return NextResponse.redirect(url);
}
export const config = { matcher: ['/admin/:path*'] };
