import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminTokenFromCookies, verifyAdminToken } from '@/lib/auth';
import slugify from '@sindresorhus/slugify';

export const runtime = 'nodejs';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const token = getAdminTokenFromCookies();
  if (!verifyAdminToken(token)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const reqItem = await prisma.coinRequest.findUnique({ where: { id: params.id } });
  if (!reqItem) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  // coin oluştur
  const base = `${reqItem.symbol}-${reqItem.name}-${reqItem.chainKind}`;
  let slug = slugify(base, { lowercase: true });
  let i = 0;
  while (await prisma.coin.findUnique({ where: { slug } })) {
    i++;
    slug = slugify(`${base}-${i}`, { lowercase: true });
  }

  await prisma.$transaction(async (tx) => {
    await tx.coin.create({
      data: {
        name: reqItem.name,
        symbol: reqItem.symbol,
        chainKind: reqItem.chainKind,
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
