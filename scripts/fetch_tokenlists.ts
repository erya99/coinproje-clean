/* eslint-disable no-console */
import { prisma } from '@/lib/prisma';
import slugifyOrig from 'slugify';

// -- helpers ---------------------------------------------------------------

function s(v?: string | null): string {
  if (!v) return '';
  return slugifyOrig(v, { lower: true, strict: true, trim: true });
}

function coinSlug(symbol?: string | null, name?: string | null): string {
  const slug = [s(symbol), s(name)].filter(Boolean).join('-');
  return slug || ('c-' + Math.random().toString(36).slice(2));
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: 'no-store', redirect: 'follow' });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  } catch (err) {
    console.warn('SKIP:', url, '-', (err as Error).message);
    return null;
  }
}

// -- sources ---------------------------------------------------------------
// schema.prisma’daki enum adlarınıza göre bunları uyarlayın
const SOURCES: Array<{ name: string; url: string; chainKind: string }> = [
  { name: 'Uniswap',      url: 'https://tokens.uniswap.org',                                   chainKind: 'EVM_ETH' },
  { name: 'Uniswap IPNS', url: 'https://gateway.ipfs.io/ipns/tokens.uniswap.org',              chainKind: 'EVM_ETH' },
  { name: 'PCS Extended', url: 'https://tokens.pancakeswap.finance/pancakeswap-extended.json', chainKind: 'EVM_BSC' },
  { name: 'PCS Top100',   url: 'https://tokens.pancakeswap.finance/pancakeswap-top-100.json',  chainKind: 'EVM_BSC' },
];

type Token = { name: string; symbol: string; address?: string; logoURI?: string };
type TokenList = { tokens?: Token[] };

// -- main ------------------------------------------------------------------

export async function reindexTokens() {
  const seen = new Set<string>();
  let upserts = 0;
  let skipped = 0;
  let scanned = 0;

  for (const src of SOURCES) {
    const data = await getJson<TokenList>(src.url);
    const tokens = data?.tokens ?? [];
    console.log(`OK: ${src.url} -> ${tokens.length} tokens`);

    for (const t of tokens) {
      scanned++;

      const slug = coinSlug(t.symbol, t.name);
      if (seen.has(slug)) {
        skipped++;
        continue;
      }
      seen.add(slug);

      const name = t.name?.trim() ?? '';
      const symbol = t.symbol?.trim() ?? '';
      const address = t.address?.trim() ?? null;
      const logoURI = t.logoURI?.trim() ?? null;

      await prisma.coin.upsert({
        where: { slug },
        // enum adları şemanıza birebir uymalı
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error chainKind enum isminizi kullanın
        update: { name, symbol, address, logoURI, chainKind: src.chainKind },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error chainKind enum isminizi kullanın
        create: { slug, name, symbol, address, logoURI, chainKind: src.chainKind },
      });

      upserts++;
    }
  }

  await prisma.$disconnect();
  return { upserts, skipped, scanned };
}

// CLI’den dosyayı direkt çalıştırınca da çalışsın
if (process.argv[1]?.includes('fetch_tokenlists')) {
  reindexTokens()
    .then((r) => console.log(`UPSERT: ${r.upserts} (skipped: ${r.skipped}, scanned: ${r.scanned})`))
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
