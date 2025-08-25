import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ChainKind } from '@prisma/client';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { name, symbol, chainKind, address, logoURI } = body || {};
  if (!name || !symbol || !chainKind || !(chainKind in ChainKind)) {
    return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 });
  }

  const data = await prisma.coinRequest.create({
    data: {
      name: String(name).trim(),
      symbol: String(symbol).trim().toUpperCase(),
      chainKind: chainKind as ChainKind,
      address: address ? String(address).trim() : null,
      logoURI: logoURI ? String(logoURI).trim() : null,
    },
  });

  return NextResponse.json({ ok: true, data });
}
