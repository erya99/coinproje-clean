import { NextResponse } from 'next/server';
import slugify from '@sindresorhus/slugify';
import { prisma } from '@/lib/prisma';
import { ChainKind } from '@prisma/client';
import { getAdminTokenFromCookies, verifyAdminToken } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const token = getAdminTokenFromCookies();
  if (!verifyAdminToken(token)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { name, symbol, chainKind, address, logoURI } = body || {};

  if (!name || !symbol || !chainKind || !(chainKind in ChainKind)) {
    return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 });
  }

  const slugBase = `${symbol}-${name}-${chainKind}`;
  let slug = slugify(slugBase, { lowercase: true });

  // slug çakışması olursa sonuna sayı ekle
  let i = 0;
  while (await prisma.coin.findUnique({ where: { slug } })) {
    i++;
    slug = slugify(`${slugBase}-${i}`, { lowercase: true });
  }

  const data = await prisma.coin.create({
    data: {
      name: String(name).trim(),
      symbol: String(symbol).trim().toUpperCase(),
      chainKind: chainKind as ChainKind,
      address: address ? String(address).trim() : null,
      logoURI: logoURI ? String(logoURI).trim() : null,
      slug,
      sources: ['admin'],
    },
  });

  return NextResponse.json({ ok: true, data });
}
