import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- Kaynak listeler (API anahtarsız, public JSON) ---
const SOURCES: string[] = [
  // Uniswap token list standardı
  'https://tokens.uniswap.org',
  'https://gateway.ipfs.io/ipns/tokens.uniswap.org',
  // PancakeSwap (BSC)
  'https://tokens.pancakeswap.finance/pancakeswap-extended.json',
  'https://tokens.pancakeswap.finance/pancakeswap-top-100.json',
  // İstersen TrustWallet listesini de ekleyebilirsin (çok büyük olabilir):
  // 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/tokenlist.json',
];

const slugify = (txt: string) =>
  txt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const evmKey = (chainId: number, address: string) =>
  `${chainId}:${address.toLowerCase()}`;

async function fetchJson(url: string) {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(`Fetch failed: ${url} ${r.status}`);
  return r.json() as Promise<any>;
}

export async function reindexTokens() {
  const seen = new Map<string, true>();
  const coins: Array<{
    chainId: number;
    address: string;
    symbol: string;
    name: string;
    logoURI: string | null;
    sources: string[];
  }> = [];

  for (const url of SOURCES) {
    try {
      const data = await fetchJson(url);
      const tokens = Array.isArray(data) ? data : data.tokens;
      if (!Array.isArray(tokens)) continue;

      for (const t of tokens) {
        const chainId = Number(t.chainId);
        const address = String(t.address || '').toLowerCase();
        const symbol = String(t.symbol || '');
        const name = String(t.name || '');

        if (!chainId || !address || !symbol || !name) continue;

        const key = evmKey(chainId, address);
        if (!seen.has(key)) {
          seen.set(key, true);
          coins.push({
            chainId,
            address,
            symbol,
            name,
            logoURI: t.logoURI || null,
            sources: [url],
          });
        } else {
          const idx = coins.findIndex(
            (c) => c.chainId === chainId && c.address === address
          );
          if (idx >= 0 && !coins[idx].sources.includes(url)) {
            coins[idx].sources.push(url);
          }
        }
      }

      console.log(`OK: ${url} -> ${Array.isArray(tokens) ? tokens.length : 0} tokens`);
    } catch (e: any) {
      console.warn(`WARN: ${url} -> ${e.message}`);
    }
  }

  let upserted = 0;
  for (const c of coins) {
    const slug = slugify(`${c.symbol}-${c.name}`);

    await prisma.coin.upsert({
      where: { chainId_address: { chainId: c.chainId, address: c.address } },
      update: {
        symbol: c.symbol,
        name: c.name,
        logoURI: c.logoURI,
        sources: c.sources,
      },
      create: {
        chainKind: 'EVM',
        chainId: c.chainId,
        address: c.address,
        symbol: c.symbol,
        name: c.name,
        slug,
        logoURI: c.logoURI,
        sources: c.sources,
      },
    });

    upserted++;
    if (upserted % 250 === 0) console.log(`UPSERT: ${upserted}`);
  }

  console.log(`UPSERT tamam: ${upserted} kayıt`);
}

// CLI'dan çalıştırmak istersen:
if (require.main === module) {
  reindexTokens()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
