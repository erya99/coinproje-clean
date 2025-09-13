import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

function pickCoinData(body: any) {
  return {
    name: body?.name as string,
    symbol: body?.symbol as string,
    slug: body?.slug as string,
    chainKind: body?.chainKind,
    chainId: body?.chainId ?? null,
    address: body?.address || null,
    logoURI: body?.logoURI || null,
  };
}

type Params = { params: { id: string } };

export async function GET(_: Request, { params }: Params) {
  const coin = await prisma.coin.findUnique({ where: { id: params.id } });
  return NextResponse.json(coin);
}

export async function PUT(req: Request, { params }: Params) {
  const body = await req.json();
  const data = pickCoinData(body);
  const updated = await prisma.coin.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: Params) {
  await prisma.coin.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
