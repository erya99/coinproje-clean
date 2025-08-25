export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminTokenFromRequest, verifyAdminToken } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // ---- Auth ----
  const token = getAdminTokenFromRequest(req);
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.coinRequest.update({
    where: { id: params.id },
    data: { status: 'REJECTED', reviewedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
