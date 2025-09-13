import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { ChainKind } from '@prisma/client';

function pickCoinData(body: any) {
  return {
    name: String(body?.name ?? ''),
    symbol: String(body?.symbol ?? ''),
    // slug'ı editte de değiştirmek istersen body.slug gönder; yoksa dokunmayız
    slug: body?.slug ? String(body.slug) : undefined,
    chainKind: body?.chainKind as ChainKind,
    chainId: body?.chainId === '' || body?.chainId === undefined ? null : Number(body.chainId),
    address: body?.address ? String(body.address) : null,
    logoURI: body?.logoURI ? String(body.logoURI) : null,
  };
}

type Params = { params: { id: string } };

export async function GET(_: Request, { params }: Params) {
  const coin = await prisma.coin.findUnique({ where: { id: params.id } });
  return NextResponse.json(coin);
}

export async function PUT(req: Request, { params }: Params) {
  const body = await req.json();
  const raw = pickCoinData(body);
  const data: any = {};
  Object.keys(raw).forEach(k => {
    const val = (raw as any)[k];
    if (val !== undefined) data[k] = val;
  });
  const updated = await prisma.coin.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: Params) {
  await prisma.coin.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
