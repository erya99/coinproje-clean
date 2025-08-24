/* eslint-disable no-console */
import slugify from '@sindresorhus/slugify';
import { ChainKind, Prisma } from '@prisma/client'; // senin prisma export yolun farklıysa düzelt
import { prisma } from '../lib/prisma';


type Row = {
  chain: ChainKind;
  chainId?: number | null;
  address: string;
  name: string;
  symbol: string;
  logoURI?: string | null;
};

// ---------- yardımcılar ----------
const EVM_CHAINS: ChainKind[] = [
  'ETHEREUM','BSC','POLYGON','ARBITRUM','OPTIMISM','BASE','AVALANCHE','FANTOM'
] as unknown as ChainKind[];

const isEvm = (c: ChainKind) => (EVM_CHAINS as unknown as string[]).includes(c as unknown as string);

function normAddress(chain: ChainKind, addr: string) {
  if (!addr) return addr;
  return isEvm(chain) ? addr.toLowerCase() : addr;
}

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json() as Promise<T>;
}

// ---------- generic tokenlist (EIP-3014) ----------
type TokenList = {
  tokens: Array<{
    chainId?: number;
    address: string;
    symbol: string;
    name: string;
    logoURI?: string;
  }>;
};

function chainFromId(id?: number): ChainKind | null {
  switch (id) {
    case 1:   return 'ETHEREUM' as ChainKind;
    case 56:  return 'BSC' as ChainKind;
    case 137: return 'POLYGON' as ChainKind;
    case 42161:return 'ARBITRUM' as ChainKind;
    case 10:  return 'OPTIMISM' as ChainKind;
    case 8453:return 'BASE' as ChainKind;
    case 43114:return 'AVALANCHE' as ChainKind;
    case 250: return 'FANTOM' as ChainKind;
    default:  return null;
  }
}

async function fromTokenList(url: string): Promise<Row[]> {
  const j = await getJSON<TokenList>(url);
  const rows: Row[] = [];
  for (const t of j.tokens ?? []) {
    const ch = chainFromId(t.chainId);
    if (!ch) continue;
    rows.push({
      chain: ch, chainId: t.chainId ?? null,
      address: t.address, name: t.name, symbol: t.symbol, logoURI: t.logoURI ?? null
    });
  }
  return rows;
}

// ---------- TrustWallet tokenlist (zincir bazlı) ----------
type TWList = { tokens: Array<{ address: string; name: string; symbol: string; logoURI?: string }> };

async function fromTrust(chain: ChainKind, twChainName: string): Promise<Row[]> {
  const url = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${twChainName}/tokenlist.json`;
  const j = await getJSON<TWList>(url);
  return (j.tokens || []).map(t => ({
    chain, chainId: null, address: t.address, name: t.name, symbol: t.symbol, logoURI: t.logoURI ?? null
  }));
}

// ---------- Jupiter (Solana) ----------
type JupiterToken = { address: string; name: string; symbol: string; logoURI?: string };
async function fromJupiter(): Promise<Row[]> {
  const list = await getJSON<JupiterToken[]>('https://cache.jup.ag/tokens');
  return list.map(t => ({
    chain: 'SOLANA' as ChainKind,
    chainId: null,
    address: t.address,
    name: t.name,
    symbol: t.symbol,
    logoURI: t.logoURI ?? null,
  }));
}

// ---------- TON jettons (opsiyonel, varsa) ----------
type TonJet = { address: string; name: string; symbol: string; image?: string };
async function fromTon(): Promise<Row[]> {
  try {
    const j = await getJSON<{ jettons: TonJet[] }>('https://raw.githubusercontent.com/ton-blockchain/token-list/main/jettons.json');
    return (j.jettons || []).map(x => ({
      chain: 'TON' as ChainKind,
      chainId: null,
      address: x.address,
      name: x.name,
      symbol: x.symbol,
      logoURI: x.image ?? null,
    }));
  } catch {
    return [];
  }
}

// ---------- ana reindex ----------
export async function reindexTokens(): Promise<number> {
  const sources: Array<() => Promise<Row[]>> = [
    // EIP-3014 conform lists
    () => fromTokenList('https://gateway.ipfs.io/ipns/tokens.uniswap.org'),
    () => fromTokenList('https://tokens.pancakeswap.finance/pancakeswap-extended.json'),
    () => fromTokenList('https://unpkg.com/quickswap-default-token-list@latest/build/quickswap-default.tokenlist.json'),

    // TrustWallet (çok zincir)
    () => fromTrust('ETHEREUM' as ChainKind, 'ethereum'),
    () => fromTrust('BSC'       as ChainKind, 'smartchain'),
    () => fromTrust('POLYGON'   as ChainKind, 'polygon'),
    () => fromTrust('ARBITRUM'  as ChainKind, 'arbitrum'),
    () => fromTrust('OPTIMISM'  as ChainKind, 'optimism'),
    () => fromTrust('BASE'      as ChainKind, 'base'),
    () => fromTrust('AVALANCHE' as ChainKind, 'avalanchec'),
    () => fromTrust('FANTOM'    as ChainKind, 'fantom'),
    () => fromTrust('TRON'      as ChainKind, 'tron'),
    () => fromTrust('SOLANA'    as ChainKind, 'solana'),

    // Solana Jupiter
    () => fromJupiter(),

    // TON (varsa)
    () => fromTon(),
  ];

  const all: Row[] = [];
  for (const fn of sources) {
    try {
      const part = await fn();
      console.log(`OK: +${part.length}`);
      all.push(...part);
    } catch (e) {
      console.warn('SKIP source:', e);
    }
  }

  // normalize + dedupe
  const seen = new Set<string>();
  let upserts = 0;

  for (const r0 of all) {
    const r: Row = {
      ...r0,
      address: normAddress(r0.chain, r0.address),
    };
    if (!r.address || !r.symbol || !r.name) continue;

    const key = `${r.chain}|${r.address}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const slug = slugify(`${r.symbol}-${r.name}-${r.chain}`);

    await prisma.coin.upsert({
      where: { // composite unique gerekiyor: @@unique([chain, address])
        chainId_address: { chain: r.chain, address: r.address } as any
      },
      update: {
        name: r.name,
        symbol: r.symbol,
        logoURI: r.logoURI ?? null,
        slug,
      },
      create: {
        chainKind: r.chain,
        chainId: r.chainId ?? null,
        address: r.address,
        name: r.name,
        symbol: r.symbol,
        logoURI: r.logoURI ?? null,
        slug,
      },
    });

    upserts++;
    if (upserts % 1000 === 0) console.log('UPSERT:', upserts);
  }

  console.log('TOTAL UPSERT:', upserts);
  return upserts;
}

// CLI
if (require.main === module) {
  reindexTokens()
    .then(n => {
      console.log('DONE', n);
      return prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
