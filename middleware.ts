import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

// SADECE /admin sayfaları; /api hariç
export const config = { matcher: ['/admin/:path*'] };

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /admin/api/... var ise (yanlışlıkla) hiç dokunma
  if (pathname.startsWith('/admin/api')) return NextResponse.next();

  // login sayfasını bırak
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    return NextResponse.next();
  }

  const token = req.cookies.get('admin_token')?.value ?? null;
  if (verifyAdminToken(token)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}
