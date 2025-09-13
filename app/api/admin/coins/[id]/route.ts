// app/api/admin/coins/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Prisma, ChainKind } from '@prisma/client';

const EVM_KINDS: ChainKind[] = ['ETHEREUM','BSC','POLYGON','ARBITRUM','OPTIMISM','BASE','AVALANCHE','FANTOM','GNOSIS','CRONOS'];
function normalizeAddress(kind: ChainKind, addr?: string | null) {
  if (!addr) return null;
  const a = String(addr).trim();
  if (!a) return null;
  return EVM_KINDS.includes(kind) ? a.toLowerCase() : a;
}

function pickBody(body: any) {
  const kind = body?.chainKind as ChainKind | undefined;
  return {
    name: body?.name !== undefined ? String(body.name) : undefined,
    symbol: body?.symbol !== undefined ? String(body.symbol) : undefined,
    slug: body?.slug !== undefined ? String(body.slug) : undefined,
    chainKind: kind,
    chainId: body?.chainId === '' || body?.chainId === undefined ? undefined : Number(body.chainId),
    address: body?.address === undefined ? undefined : normalizeAddress(kind ?? body.chainKind, body.address),
    logoURI: body?.logoURI === undefined ? undefined : (body.logoURI ? String(body.logoURI) : null),
  };
}

type Params = { params: { id: string } };

export async function GET(_: Request, { params }: Params) {
  const coin = await prisma.coin.findUnique({ where: { id: params.id } });
  return NextResponse.json(coin);
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const raw = pickBody(body);
    const data: any = {};
    for (const k in raw) if ((raw as any)[k] !== undefined) data[k] = (raw as any)[k];

    const updated = await prisma.coin.update({ where: { id: params.id }, data });
    return NextResponse.json(updated);
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json(
        { error: 'Duplicate: same address already exists on this chain (or slug already taken).' },
        { status: 409 }
      );
    }
    console.error('PUT /api/admin/coins/[id]', err);
    return NextResponse.json({ error: 'PUT failed' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    await prisma.coin.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/admin/coins/[id]', err);
    return NextResponse.json({ error: 'DELETE failed' }, { status: 500 });
  }
}
