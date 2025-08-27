// app/admin/api/requests/[id]/reject/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminTokenFromRequest, verifyAdminToken } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // admin doğrulama
  const token = getAdminTokenFromRequest(req);
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.coinRequest.delete({ where: { id: params.id } });
  } catch {
    // yoksa sessiz geç
  }

  // listeye geri dön (303: her zaman GET)
  return NextResponse.redirect(new URL('/admin/request', req.url), { status: 303 });
}
