/* eslint-disable no-console */
import slugify from '@sindresorhus/slugify';
import { ChainKind, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

type Row = {
  chain: ChainKind;
  chainId?: number | null;
  address: string;
  name: string;
  symbol: string;
  logoURI?: string | null;
};

// ---------- Zincir tanımları ----------
const EVM_CHAINS: ChainKind[] = [
  'ETHEREUM','BSC','POLYGON','ARBITRUM','OPTIMISM','BASE','AVALANCHE','FANTOM'
] as unknown as ChainKind[];

const isEvm = (c: ChainKind) => (EVM_CHAINS as unknown as string[]).includes(c as unknown as string);

function normAddress(chain: ChainKind, addr: string) {
  if (!addr) return addr;
  return isEvm(chain) ? addr.toLowerCase() : addr;
}

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { 
    cache: 'no-store',
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TokenIndexer/1.0)' }
  });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json() as Promise<T>;
}

// ---------- EIP-3014 Token Lists ----------
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
    case 1:     return 'ETHEREUM' as ChainKind;
    case 56:    return 'BSC' as ChainKind;
    case 137:   return 'POLYGON' as ChainKind;
    case 42161: return 'ARBITRUM' as ChainKind;
    case 10:    return 'OPTIMISM' as ChainKind;
    case 8453:  return 'BASE' as ChainKind;
    case 43114: return 'AVALANCHE' as ChainKind;
    case 250:   return 'FANTOM' as ChainKind;
    case 100:   return 'GNOSIS' as ChainKind;
    case 25:    return 'CRONOS' as ChainKind;
    case 324:   return 'OTHER' as ChainKind; // zkSync Era
    case 59144: return 'OTHER' as ChainKind; // Linea
    case 534352:return 'OTHER' as ChainKind; // Scroll
    case 1284:  return 'OTHER' as ChainKind; // Moonbeam
    case 1285:  return 'OTHER' as ChainKind; // Moonriver
    case 42220: return 'OTHER' as ChainKind; // Celo
    case 1666600000: return 'OTHER' as ChainKind; // Harmony
    default:    return null;
  }
}

async function fromTokenList(url: string): Promise<Row[]> {
  const j = await getJSON<TokenList>(url);
  const rows: Row[] = [];
  for (const t of j.tokens ?? []) {
    const ch = chainFromId(t.chainId);
    if (!ch) continue;
    rows.push({
      chain: ch, 
      chainId: t.chainId ?? null,
      address: t.address, 
      name: t.name, 
      symbol: t.symbol, 
      logoURI: t.logoURI ?? null
    });
  }
  return rows;
}

// ---------- TrustWallet Lists ----------
type TWList = { 
  tokens: Array<{ 
    address: string; 
    name: string; 
    symbol: string; 
    logoURI?: string 
  }> 
};

async function fromTrust(chain: ChainKind, twChainName: string): Promise<Row[]> {
  const url = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${twChainName}/tokenlist.json`;
  const j = await getJSON<TWList>(url);
  return (j.tokens || []).map(t => ({
    chain, 
    chainId: null, 
    address: t.address, 
    name: t.name, 
    symbol: t.symbol, 
    logoURI: t.logoURI ?? null
  }));
}

// ---------- Jupiter (Solana) ----------
type JupiterToken = { 
  address: string; 
  name: string; 
  symbol: string; 
  logoURI?: string 
};

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

// ---------- TON Jettons ----------
type TonJet = { 
  address: string; 
  name: string; 
  symbol: string; 
  image?: string 
};

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

// ---------- NEAR Tokens ----------
async function fromNear(): Promise<Row[]> {
  try {
    const tokens = await getJSON<any[]>('https://raw.githubusercontent.com/ref-finance/token-list/main/src/tokens/near-mainnet.json');
    return tokens.map(t => ({
      chain: 'NEAR' as ChainKind,
      chainId: null,
      address: t.address || t.id,
      name: t.name,
      symbol: t.symbol,
      logoURI: t.logoURI || t.icon,
    }));
  } catch {
    return [];
  }
}

// ---------- Sui Coins ----------
async function fromSui(): Promise<Row[]> {
  try {
    const coins = await getJSON<any[]>('https://raw.githubusercontent.com/MystenLabs/sui-packages/main/tokens/sui-mainnet.json');
    return coins.map(c => ({
      chain: 'SUI' as ChainKind,
      chainId: null,
      address: c.address,
      name: c.name,
      symbol: c.symbol,
      logoURI: c.logoURI,
    }));
  } catch {
    return [];
  }
}

// ---------- Aptos Coins ----------
async function fromAptos(): Promise<Row[]> {
  try {
    const coins = await getJSON<any[]>('https://raw.githubusercontent.com/PancakeSwap/token-list/main/lists/aptos.json');
    return coins.map(c => ({
      chain: 'APTOS' as ChainKind,
      chainId: null,
      address: c.address,
      name: c.name,
      symbol: c.symbol,
      logoURI: c.logoURI,
    }));
  } catch {
    return [];
  }
}

// ---------- Cosmos Ecosystem ----------
async function fromCosmos(): Promise<Row[]> {
  try {
    const assets = await getJSON<{assets: any[]}>('https://raw.githubusercontent.com/cosmos/chain-registry/master/assetlist.json');
    const rows: Row[] = [];
    
    for (const asset of assets.assets || []) {
      if (asset.denom_units && asset.symbol && asset.name) {
        rows.push({
          chain: 'COSMOS' as ChainKind,
          chainId: null,
          address: asset.base || asset.denom_units[0]?.denom || '',
          name: asset.name,
          symbol: asset.symbol,
          logoURI: asset.logo_URIs?.png || asset.logo_URIs?.svg || null,
        });
      }
    }
    return rows;
  } catch {
    return [];
  }
}

// ---------- DeFiLlama Token Lists ----------
async function fromDefillama(): Promise<Row[]> {
  try {
    const protocols = await getJSON<any[]>('https://api.llama.fi/protocols');
    const rows: Row[] = [];
    
    for (const protocol of protocols) {
      if (protocol.symbol && protocol.name && protocol.chain) {
        let chain: ChainKind | null = null;
        
        // Chain mapping
        switch (protocol.chain.toLowerCase()) {
          case 'ethereum': chain = 'ETHEREUM' as ChainKind; break;
          case 'bsc': case 'binance': chain = 'BSC' as ChainKind; break;
          case 'polygon': chain = 'POLYGON' as ChainKind; break;
          case 'arbitrum': chain = 'ARBITRUM' as ChainKind; break;
          case 'optimism': chain = 'OPTIMISM' as ChainKind; break;
          case 'base': chain = 'BASE' as ChainKind; break;
          case 'avalanche': chain = 'AVALANCHE' as ChainKind; break;
          case 'fantom': chain = 'FANTOM' as ChainKind; break;
          case 'solana': chain = 'SOLANA' as ChainKind; break;
          case 'near': chain = 'NEAR' as ChainKind; break;
          case 'sui': chain = 'SUI' as ChainKind; break;
          case 'aptos': chain = 'APTOS' as ChainKind; break;
          default: chain = 'OTHER' as ChainKind;
        }
        
        if (chain) {
          rows.push({
            chain,
            chainId: null,
            address: protocol.address || `native-${protocol.slug}`,
            name: protocol.name,
            symbol: protocol.symbol,
            logoURI: protocol.logo || null,
          });
        }
      }
    }
    return rows;
  } catch {
    return [];
  }
}

// ---------- Ana Coinleri Ekle ----------
async function addNativeCoins(): Promise<Row[]> {
  const natives: Row[] = [
    // Major natives
    { chain: 'BITCOIN' as ChainKind, chainId: null, address: 'native', name: 'Bitcoin', symbol: 'BTC', logoURI: null },
    { chain: 'ETHEREUM' as ChainKind, chainId: 1, address: 'native', name: 'Ethereum', symbol: 'ETH', logoURI: null },
    { chain: 'BSC' as ChainKind, chainId: 56, address: 'native', name: 'BNB', symbol: 'BNB', logoURI: null },
    { chain: 'POLYGON' as ChainKind, chainId: 137, address: 'native', name: 'Polygon', symbol: 'MATIC', logoURI: null },
    { chain: 'ARBITRUM' as ChainKind, chainId: 42161, address: 'native', name: 'Arbitrum', symbol: 'ARB', logoURI: null },
    { chain: 'OPTIMISM' as ChainKind, chainId: 10, address: 'native', name: 'Optimism', symbol: 'OP', logoURI: null },
    { chain: 'BASE' as ChainKind, chainId: 8453, address: 'native', name: 'Base', symbol: 'ETH', logoURI: null },
    { chain: 'AVALANCHE' as ChainKind, chainId: 43114, address: 'native', name: 'Avalanche', symbol: 'AVAX', logoURI: null },
    { chain: 'FANTOM' as ChainKind, chainId: 250, address: 'native', name: 'Fantom', symbol: 'FTM', logoURI: null },
    { chain: 'SOLANA' as ChainKind, chainId: null, address: 'native', name: 'Solana', symbol: 'SOL', logoURI: null },
    { chain: 'TON' as ChainKind, chainId: null, address: 'native', name: 'Toncoin', symbol: 'TON', logoURI: null },
    { chain: 'TRON' as ChainKind, chainId: null, address: 'native', name: 'Tron', symbol: 'TRX', logoURI: null },
    { chain: 'NEAR' as ChainKind, chainId: null, address: 'native', name: 'NEAR Protocol', symbol: 'NEAR', logoURI: null },
    { chain: 'SUI' as ChainKind, chainId: null, address: 'native', name: 'Sui', symbol: 'SUI', logoURI: null },
    { chain: 'APTOS' as ChainKind, chainId: null, address: 'native', name: 'Aptos', symbol: 'APT', logoURI: null },
    { chain: 'COSMOS' as ChainKind, chainId: null, address: 'native', name: 'Cosmos Hub', symbol: 'ATOM', logoURI: null },
    { chain: 'DOGE' as ChainKind, chainId: null, address: 'native', name: 'Dogecoin', symbol: 'DOGE', logoURI: null },
    { chain: 'LITECOIN' as ChainKind, chainId: null, address: 'native', name: 'Litecoin', symbol: 'LTC', logoURI: null },
  ];
  
  return natives;
}

// ---------- Ana reindex fonksiyonu ----------
export async function reindexTokens(): Promise<number> {
  console.log('🚀 Token reindexing başladı...');
  
  const sources: Array<{ name: string, fn: () => Promise<Row[]> }> = [
    // Native coinler
    { name: 'Native Coins', fn: () => addNativeCoins() },
    
    // EIP-3014 Token Lists
    { name: 'Uniswap', fn: () => fromTokenList('https://gateway.ipfs.io/ipns/tokens.uniswap.org') },
    { name: 'PancakeSwap', fn: () => fromTokenList('https://tokens.pancakeswap.finance/pancakeswap-extended.json') },
    { name: 'QuickSwap', fn: () => fromTokenList('https://unpkg.com/quickswap-default-token-list@latest/build/quickswap-default.tokenlist.json') },
    { name: '1inch', fn: () => fromTokenList('https://gateway.ipfs.io/ipns/tokens.1inch.eth') },
    { name: 'Compound', fn: () => fromTokenList('https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json') },
    { name: 'Aave', fn: () => fromTokenList('https://tokenlist.aave.eth.link') },
    { name: 'SushiSwap', fn: () => fromTokenList('https://token-list.sushi.com') },
    
    // TrustWallet Lists (Çok kapsamlı)
    { name: 'TW Ethereum', fn: () => fromTrust('ETHEREUM' as ChainKind, 'ethereum') },
    { name: 'TW BSC', fn: () => fromTrust('BSC' as ChainKind, 'smartchain') },
    { name: 'TW Polygon', fn: () => fromTrust('POLYGON' as ChainKind, 'polygon') },
    { name: 'TW Arbitrum', fn: () => fromTrust('ARBITRUM' as ChainKind, 'arbitrum') },
    { name: 'TW Optimism', fn: () => fromTrust('OPTIMISM' as ChainKind, 'optimism') },
    { name: 'TW Base', fn: () => fromTrust('BASE' as ChainKind, 'base') },
    { name: 'TW Avalanche', fn: () => fromTrust('AVALANCHE' as ChainKind, 'avalanchec') },
    { name: 'TW Fantom', fn: () => fromTrust('FANTOM' as ChainKind, 'fantom') },
    { name: 'TW Tron', fn: () => fromTrust('TRON' as ChainKind, 'tron') },
    { name: 'TW Solana', fn: () => fromTrust('SOLANA' as ChainKind, 'solana') },
    
    // Özel platformlar
    { name: 'Jupiter (Solana)', fn: () => fromJupiter() },
    { name: 'TON Jettons', fn: () => fromTon() },
    { name: 'NEAR Tokens', fn: () => fromNear() },
    { name: 'Sui Coins', fn: () => fromSui() },
    { name: 'Aptos Coins', fn: () => fromAptos() },
    { name: 'Cosmos Assets', fn: () => fromCosmos() },
    { name: 'DeFiLlama Protocols', fn: () => fromDefillama() },
  ];

  const all: Row[] = [];
  let totalSources = sources.length;
  let successCount = 0;

  for (const [index, {name, fn}] of sources.entries()) {
    try {
      console.log(`📡 [${index + 1}/${totalSources}] ${name} yükleniyor...`);
      const part = await fn();
      console.log(`✅ ${name}: +${part.length} token`);
      all.push(...part);
      successCount++;
    } catch (e) {
      console.warn(`❌ ${name}: SKIP -`, (e as Error).message);
    }
  }

  console.log(`\n📊 Özet: ${successCount}/${totalSources} kaynak başarılı, ${all.length} toplam token`);

  // Normalize + Dedupe
  const seen = new Set<string>();
  let upserts = 0;
  let skipped = 0;

  console.log('\n💾 Veritabanına yazılıyor...');

  for (const r0 of all) {
    const r: Row = {
      ...r0,
      address: normAddress(r0.chain, r0.address),
    };

    // Validation
    if (!r.address || !r.symbol?.trim() || !r.name?.trim()) {
      skipped++;
      continue;
    }

    // Dedupe key
    const key = `${r.chain}|${r.address}`;
    if (seen.has(key)) {
      skipped++;
      continue;
    }
    seen.add(key);

    // Slug oluştur
    const slug = slugify(`${r.symbol}-${r.name}-${r.chain}`);

    // chainId null ise varsayılan değer ata
    const normalizedChainId = r.chainId ?? (function() {
      // chainId null ise chain'e göre varsayılan değer ata
      const chainStr = r.chain as string;
      switch (chainStr) {
        case 'ETHEREUM': return 1;
        case 'BSC': return 56;
        case 'POLYGON': return 137;
        case 'ARBITRUM': return 42161;
        case 'OPTIMISM': return 10;
        case 'BASE': return 8453;
        case 'AVALANCHE': return 43114;
        case 'FANTOM': return 250;
        case 'GNOSIS': return 100;
        case 'CRONOS': return 25;
        // Non-EVM chains için negatif değerler
        case 'SOLANA': return -1;
        case 'TON': return -2;
        case 'TRON': return -3;
        case 'NEAR': return -4;
        case 'SUI': return -5;
        case 'APTOS': return -6;
        case 'COSMOS': return -7;
        case 'BITCOIN': return -8;
        case 'DOGE': return -9;
        case 'LITECOIN': return -10;
        case 'STARKNET': return -11;
        default: return -999; // OTHER için
      }
    })();

    try {
      await prisma.coin.upsert({
        where: { 
          chainId_address: { 
            chainId: normalizedChainId,
            address: r.address 
          }
        },
        update: {
          name: r.name.trim(),
          symbol: r.symbol.trim(),
          logoURI: r.logoURI,
          slug,
          updatedAt: new Date(),
        },
        create: {
          chainKind: r.chain,
          chainId: normalizedChainId,
          address: r.address,
          name: r.name.trim(),
          symbol: r.symbol.trim(),
          logoURI: r.logoURI,
          slug,
          sources: ['automated-import'],
        },
      });

      upserts++;
      if (upserts % 500 === 0) {
        console.log(`⏳ ${upserts} token işlendi...`);
      }
    } catch (e) {
      console.warn(`⚠️  Upsert hatası (${r.symbol}):`, (e as Error).message);
    }
  }

  console.log(`\n🎉 Tamamlandı!`);
  console.log(`📈 ${upserts} token güncellendi/eklendi`);
  console.log(`⏭️  ${skipped} token atlandı (duplicate/invalid)`);
  
  return upserts;
}

// CLI
if (require.main === module) {
  reindexTokens()
    .then(n => {
      console.log(`\n✨ BAŞARILI: ${n} token işlendi`);
      return prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error('\n💥 HATA:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}