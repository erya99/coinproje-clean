export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import slugify from '@sindresorhus/slugify';
import { prisma } from '@/lib/prisma';
import { getAdminTokenFromRequest, verifyAdminToken } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // ---- Auth ----
  const token = getAdminTokenFromRequest(req);
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const reqItem = await prisma.coinRequest.findUnique({ where: { id: params.id } });
  if (!reqItem) {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  // slug benzersizliği
  const base = `${reqItem.symbol}-${reqItem.name}-${reqItem.chainKind}`;
  let slug = slugify(base, { lowercase: true });
  for (let i = 1; i < 50; i++) {
    const exists = await prisma.coin.findUnique({ where: { slug } });
    if (!exists) break;
    slug = slugify(`${base}-${i}`, { lowercase: true });
  }

  await prisma.$transaction(async (tx) => {
    await tx.coin.create({
      data: {
        name: reqItem.name,
        symbol: reqItem.symbol.toUpperCase(),
        chainKind: reqItem.chainKind,
        address: reqItem.address || null,
        logoURI: reqItem.logoURI || null,
        slug,
        sources: ['request'],
      },
    });

    await tx.coinRequest.update({
      where: { id: reqItem.id },
      data: { status: 'APPROVED', reviewedAt: new Date() },
    });
  });

  return NextResponse.json({ ok: true });
}
