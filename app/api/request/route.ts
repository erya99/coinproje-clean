// app/api/request/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ChainKind } from '@prisma/client';

type Payload = {
  name: string;
  symbol: string;
  chainKind?: keyof typeof ChainKind | null;
  address?: string | null;
  logoURI?: string | null;
};

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

async function readPayload(req: Request): Promise<Payload> {
  const ct = req.headers.get('content-type')?.toLowerCase() || '';
  // JSON ise
  if (ct.includes('application/json')) {
    const j = await req.json();
    return {
      name: str(j?.name).trim(),
      symbol: str(j?.symbol).trim(),
      chainKind: str(j?.chainKind).trim().toUpperCase() as any,
      address: str(j?.address).trim() || null,
      logoURI: str(j?.logoURI).trim() || null,
    };
  }
  // Değilse FormData kabul et
  const f = await req.formData();
  return {
    name: str(f.get('name')).trim(),
    symbol: str(f.get('symbol')).trim(),
    chainKind: str(f.get('chainKind')).trim().toUpperCase() as any,
    address: str(f.get('address')).trim() || null,
    logoURI: str(f.get('logoURI')).trim() || null,
  };
}

export async function POST(req: Request) {
  try {
    const body = await readPayload(req);

    if (!body.name || !body.symbol) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Geçerli bir ChainKind değilse OTHER yap
    const validKinds = new Set(Object.keys(ChainKind));
    const kind: ChainKind =
      (validKinds.has(body.chainKind || '') ? body.chainKind : 'OTHER') as ChainKind;

    await prisma.coinRequest.create({
      data: {
        name: body.name,
        symbol: body.symbol.toUpperCase(),
        chainKind: kind,
        address: body.address,
        logoURI: body.logoURI,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Invalid body' },
      { status: 400 }
    );
  }
}
