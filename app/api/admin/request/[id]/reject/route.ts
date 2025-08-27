// app/admin/api/request/[id]/reject/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminTokenFromRequest, verifyAdminToken } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // admin cookie doğrula
  const token = getAdminTokenFromRequest(req);
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // İsteği tamamen sil
    await prisma.coinRequest.delete({ where: { id: params.id } });
  } catch {
    // yoksa sorun etmeyelim
  }

  // Listeye geri dön
  const back = new URL('/admin/request', req.url);
  return NextResponse.redirect(back, { status: 303 });
}
