import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { ChainKind } from '@prisma/client';
import { Prisma } from '@prisma/client';

function slugify(s:string){ return s.toLowerCase().trim().replace(/['"()]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }
async function ensureUniqueSlug(base:string){
  let s = base || 'coin', i = 1;
  while (await prisma.coin.findUnique({ where:{ slug:s } })) s = `${base}-${i++}`;
  return s;
}

// EVM-benzeri zincirlerde adresi lowercase'e çekelim (checksum değil ama uniq karşılaştırmada tutarlı)
const EVM_KINDS: ChainKind[] = ['ETHEREUM','BSC','POLYGON','ARBITRUM','OPTIMISM','BASE','AVALANCHE','FANTOM','GNOSIS','CRONOS'];
function normalizeAddress(kind: ChainKind, addr?: string | null) {
  if (!addr) return null;
  const a = addr.trim();
  if (!a) return null;
  return EVM_KINDS.includes(kind) ? a.toLowerCase() : a;
}

function pickBody(body: any) {
  const kind = body?.chainKind as ChainKind;
  return {
    name: String(body?.name ?? ''),
    symbol: String(body?.symbol ?? ''),
    chainKind: kind,
    chainId: body?.chainId === '' || body?.chainId === undefined ? null : Number(body.chainId),
    address: normalizeAddress(kind, body?.address),
    logoURI: body?.logoURI ? String(body.logoURI) : null,
  };
}

export async function GET() {
  const coins = await prisma.coin.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(coins);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = pickBody(body);

    // slug otomatik
    const base = slugify(data.name || data.symbol);
    const slug = await ensureUniqueSlug(base || 'coin');

    const created = await prisma.coin.create({ data: { ...data, slug } });
    return NextResponse.json(created);
  } catch (err: any) {
    // Duplicate (adres+chain ya da slug) → 409
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'Duplicate: same address already exists on this chain (or slug already taken).' }, { status: 409 });
    }
    console.error('POST /api/admin/coins', err);
    return NextResponse.json({ error: 'POST failed' }, { status: 500 });
  }
}
