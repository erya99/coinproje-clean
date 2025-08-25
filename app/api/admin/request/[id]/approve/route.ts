export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';
import slugify from '@sindresorhus/slugify';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get('admin_token')?.value || null;
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const reqItem = await prisma.coinRequest.findUnique({ where: { id: params.id } });
  if (!reqItem) {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  // benzersiz slug üret
  const base = `${reqItem.symbol}-${reqItem.name}-${reqItem.chainKind}`;
  let slug = slugify(base, { lowercase: true });
  for (let i = 1; await prisma.coin.findUnique({ where: { slug } }); i++) {
    slug = slugify(`${base}-${i}`, { lowercase: true });
  }

  await prisma.$transaction(async (tx) => {
    await tx.coin.create({
      data: {
        name: reqItem.name,
        symbol: reqItem.symbol,
        chainKind: reqItem.chainKind, // Prisma enum ile uyumlu
        address: reqItem.address,
        logoURI: reqItem.logoURI,
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
