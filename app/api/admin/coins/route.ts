import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { ChainKind } from '@prisma/client';

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/['"()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function ensureUniqueSlug(base: string) {
  let s = base || 'coin';
  let i = 1;
  while (true) {
    const exists = await prisma.coin.findUnique({ where: { slug: s } });
    if (!exists) return s;
    s = `${base}-${i++}`;
  }
}

function pickCoinData(body: any) {
  // Şemanla birebir uyumlu alanlar:
  return {
    name: String(body?.name ?? ''),
    symbol: String(body?.symbol ?? ''),
    // slug yoksa API içinde üretilecek
    chainKind: body?.chainKind as ChainKind,
    chainId: body?.chainId === '' || body?.chainId === undefined ? null : Number(body.chainId),
    address: body?.address ? String(body.address) : null,
    logoURI: body?.logoURI ? String(body.logoURI) : null,
  };
}

export async function GET() {
  const coins = await prisma.coin.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(coins);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = pickCoinData(body);

  // slug otomatik
  const requested = String(body?.slug ?? '').trim();
  const base = requested || slugify(data.name || data.symbol);
  const slug = await ensureUniqueSlug(base);

  const created = await prisma.coin.create({
    data: { ...data, slug },
  });
  return NextResponse.json(created);
}
