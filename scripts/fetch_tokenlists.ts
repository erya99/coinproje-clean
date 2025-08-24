/* eslint-disable no-console */
import slugify from '@sindresorhus/slugify';
import { ChainKind, PrismaClient } from '@prisma/client';

// Prisma client'i burada initialize ediyoruz
const prisma = new PrismaClient();

// ChainKind enum değerlerini manuel olarak tanımlıyoruz (fallback için)
const CHAIN_KINDS = {
  EVM: 'EVM' as ChainKind,
  ETHEREUM: 'ETHEREUM' as ChainKind,
  BSC: 'BSC' as ChainKind,
  POLYGON: 'POLYGON' as ChainKind,
  ARBITRUM: 'ARBITRUM' as ChainKind,
  OPTIMISM: 'OPTIMISM' as ChainKind,
  BASE: 'BASE' as ChainKind,
  AVALANCHE: 'AVALANCHE' as ChainKind,
  FANTOM: 'FANTOM' as ChainKind,
  GNOSIS: 'GNOSIS' as ChainKind,
  CRONOS: 'CRONOS' as ChainKind,
  SOLANA: 'SOLANA' as ChainKind,
  TRON: 'TRON' as ChainKind,
  TON: 'TON' as ChainKind,
  NEAR: 'NEAR' as ChainKind,
  COSMOS: 'COSMOS' as ChainKind,
  SUI: 'SUI' as ChainKind,
  APTOS: 'APTOS' as ChainKind,
  STARKNET: 'STARKNET' as ChainKind,
  BITCOIN: 'BITCOIN' as ChainKind,
  DOGE: 'DOGE' as ChainKind,
  LITECOIN: 'LITECOIN' as ChainKind,
  NATIVE: 'NATIVE' as ChainKind,
  OTHER: 'OTHER' as ChainKind,
} as const;

type TokenData = {
  chain: ChainKind;
  chainId?: number | null;
  address: string;
  name: string;
  symbol: string;
  logoURI?: string | null;
  source: string;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchSafe<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15 saniye timeout

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TokenIndexer/1.0)',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json() as Promise<T>;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

/** EVM chainId -> ChainKind mapping */
function mapChainId(chainId: number): ChainKind | null {
  switch (chainId) {
    case 1:
      return CHAIN_KINDS.ETHEREUM;
    case 56:
      return CHAIN_KINDS.BSC;
    case 137:
      return CHAIN_KINDS.POLYGON;
    case 42161:
      return CHAIN_KINDS.ARBITRUM;
    case 10:
      return CHAIN_KINDS.OPTIMISM;
    case 8453:
      return CHAIN_KINDS.BASE;
    case 43114:
      return CHAIN_KINDS.AVALANCHE;
    case 250:
      return CHAIN_KINDS.FANTOM;
    case 100:
      return CHAIN_KINDS.GNOSIS;
    case 25:
      return CHAIN_KINDS.CRONOS;
    default:
      return null;
  }
}

function validateToken(token: any): boolean {
  return !!(
    token &&
    typeof token.address === 'string' &&
    token.address.trim().length > 0 &&
    typeof token.name === 'string' &&
    token.name.trim().length > 0 &&
    typeof token.symbol === 'string' &&
    token.symbol.trim().length > 0
  );
}

/* ---------------- 1) Uniswap ---------------- */
async function fetchUniswapTokens(): Promise<TokenData[]> {
  console.log('🦄 Uniswap resmi token listesi getiriliyor...');
  try {
    const data = await fetchSafe<{ tokens: any[] }>('https://gateway.ipfs.io/ipns/tokens.uniswap.org');

    if (!data.tokens || !Array.isArray(data.tokens)) {
      throw new Error('Geçersiz token listesi formatı');
    }

    const tokens = data.tokens
      .filter(validateToken)
      .map((t) => {
        const chain = mapChainId(t.chainId);
        if (!chain) return null;
        
        return {
          chain,
          chainId: t.chainId,
          address: String(t.address).toLowerCase().trim(),
          name: String(t.name).trim(),
          symbol: String(t.symbol).trim().toUpperCase(),
          logoURI: t.logoURI || null,
          source: 'uniswap-official',
        } as TokenData;
      })
      .filter((t): t is TokenData => t !== null);

    console.log(`✅ Uniswap: ${tokens.length} token başarıyla alındı`);
    return tokens;
  } catch (error) {
    console.warn('❌ Uniswap hatası:', error instanceof Error ? error.message : error);
    return [];
  }
}

/* ---------------- 2) PancakeSwap ---------------- */
async function fetchPancakeSwapTokens(): Promise<TokenData[]> {
  console.log('🥞 PancakeSwap resmi token listesi getiriliyor...');
  const urls = [
    'https://tokens.pancakeswap.finance/pancakeswap-extended.json',
    'https://tokens.pancakeswap.finance/pancakeswap-top-100.json',
  ];

  const allTokens: TokenData[] = [];
  
  for (const url of urls) {
    try {
      console.log(`📡 ${url} getiriliyor...`);
      const data = await fetchSafe<{ tokens: any[] }>(url);

      if (!data.tokens || !Array.isArray(data.tokens)) {
        console.warn(`⚠️ Geçersiz format: ${url}`);
        continue;
      }

      const tokens = data.tokens
        .filter(validateToken)
        .map((t) => {
          const chain = mapChainId(t.chainId);
          if (!chain) return null;
          
          return {
            chain,
            chainId: t.chainId,
            address: String(t.address).toLowerCase().trim(),
            name: String(t.name).trim(),
            symbol: String(t.symbol).trim().toUpperCase(),
            logoURI: t.logoURI || null,
            source: 'pancakeswap-official',
          } as TokenData;
        })
        .filter((t): t is TokenData => t !== null);

      allTokens.push(...tokens);
      console.log(`✅ PancakeSwap ${new URL(url).pathname}: ${tokens.length} token`);
      await delay(500);
    } catch (error) {
      console.warn(`❌ PancakeSwap ${url} hatası:`, error instanceof Error ? error.message : error);
    }
  }
  
  return allTokens;
}

/* ---------------- 3) TrustWallet ---------------- */
async function fetchTrustWalletTokens(): Promise<TokenData[]> {
  console.log('👛 TrustWallet token listeleri getiriliyor...');

  const chains = [
    { name: 'ethereum', chainKind: CHAIN_KINDS.ETHEREUM, chainId: 1 },
    { name: 'smartchain', chainKind: CHAIN_KINDS.BSC, chainId: 56 },
    { name: 'polygon', chainKind: CHAIN_KINDS.POLYGON, chainId: 137 },
    { name: 'arbitrum', chainKind: CHAIN_KINDS.ARBITRUM, chainId: 42161 },
    { name: 'optimism', chainKind: CHAIN_KINDS.OPTIMISM, chainId: 10 },
    { name: 'base', chainKind: CHAIN_KINDS.BASE, chainId: 8453 },
    { name: 'avalanchec', chainKind: CHAIN_KINDS.AVALANCHE, chainId: 43114 },
    { name: 'fantom', chainKind: CHAIN_KINDS.FANTOM, chainId: 250 },
    { name: 'solana', chainKind: CHAIN_KINDS.SOLANA, chainId: null },
  ] as const;

  const allTokens: TokenData[] = [];
  
  for (const chain of chains) {
    try {
      const url = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain.name}/tokenlist.json`;
      console.log(`📡 TrustWallet ${chain.name} getiriliyor...`);
      
      const data = await fetchSafe<{ tokens: any[] }>(url);

      if (!data.tokens || !Array.isArray(data.tokens)) {
        console.warn(`⚠️ TrustWallet ${chain.name}: Geçersiz format`);
        continue;
      }

      const tokens = data.tokens
        .filter(validateToken)
        .map((t) => ({
          chain: chain.chainKind,
          chainId: chain.chainId,
          address: String(t.address).toLowerCase().trim(),
          name: String(t.name).trim(),
          symbol: String(t.symbol).trim().toUpperCase(),
          logoURI: t.logoURI || 
            `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain.name}/assets/${t.address}/logo.png`,
          source: 'trustwallet',
        })) satisfies TokenData[];

      allTokens.push(...tokens);
      console.log(`✅ TrustWallet ${chain.name}: ${tokens.length} token`);
      await delay(300);
    } catch (error) {
      console.warn(`❌ TrustWallet ${chain.name} hatası:`, error instanceof Error ? error.message : error);
    }
  }
  
  return allTokens;
}

/* ---------------- 4) Jupiter (Solana) ---------------- */
async function fetchJupiterTokens(): Promise<TokenData[]> {
  console.log('🪐 Jupiter Solana token listesi getiriliyor...');
  try {
    const data = await fetchSafe<any[]>('https://cache.jup.ag/tokens');

    if (!Array.isArray(data)) {
      throw new Error('Geçersiz Jupiter token listesi formatı');
    }

    const tokens = data
      .filter(validateToken)
      .map((t) => ({
        chain: CHAIN_KINDS.SOLANA,
        chainId: null,
        address: String(t.address).trim(),
        name: String(t.name).trim(),
        symbol: String(t.symbol).trim().toUpperCase(),
        logoURI: t.logoURI || null,
        source: 'jupiter-official',
      })) satisfies TokenData[];

    console.log(`✅ Jupiter: ${tokens.length} Solana token`);
    return tokens;
  } catch (error) {
    console.warn('❌ Jupiter hatası:', error instanceof Error ? error.message : error);
    return [];
  }
}

/* ---------------- 5) DeFi resmi listeler ---------------- */
async function fetchDeFiProtocolTokens(): Promise<TokenData[]> {
  console.log('🏦 DeFi protokol token listeleri getiriliyor...');
  
  const sources = [
    { 
      name: 'Compound', 
      url: 'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json', 
      source: 'compound-official' 
    },
    { 
      name: 'Aave', 
      url: 'https://tokenlist.aave.eth.link', 
      source: 'aave-official' 
    },
    { 
      name: 'SushiSwap', 
      url: 'https://token-list.sushi.com', 
      source: 'sushiswap-official' 
    },
  ];

  const allTokens: TokenData[] = [];
  
  for (const src of sources) {
    try {
      console.log(`📡 ${src.name} getiriliyor...`);
      const data = await fetchSafe<{ tokens: any[] }>(src.url);

      if (!data.tokens || !Array.isArray(data.tokens)) {
        console.warn(`⚠️ ${src.name}: Geçersiz format`);
        continue;
      }

      const tokens = data.tokens
        .filter(validateToken)
        .map((t) => {
          const chain = mapChainId(t.chainId);
          if (!chain) return null;
          
          return {
            chain,
            chainId: t.chainId,
            address: String(t.address).toLowerCase().trim(),
            name: String(t.name).trim(),
            symbol: String(t.symbol).trim().toUpperCase(),
            logoURI: t.logoURI || null,
            source: src.source,
          } as TokenData;
        })
        .filter((t): t is TokenData => t !== null);

      allTokens.push(...tokens);
      console.log(`✅ ${src.name}: ${tokens.length} token`);
      await delay(400);
    } catch (error) {
      console.warn(`❌ ${src.name} hatası:`, error instanceof Error ? error.message : error);
    }
  }
  
  return allTokens;
}

/* ---------------- 6) Native coin'ler ---------------- */
async function addNativeCoins(): Promise<TokenData[]> {
  console.log("💎 Native coin'ler ekleniyor...");
  
  const natives: TokenData[] = [
    { 
      chain: CHAIN_KINDS.BITCOIN, 
      chainId: null, 
      address: 'native', 
      name: 'Bitcoin', 
      symbol: 'BTC', 
      source: 'native', 
      logoURI: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' 
    },
    { 
      chain: CHAIN_KINDS.ETHEREUM, 
      chainId: 1, 
      address: 'native', 
      name: 'Ethereum', 
      symbol: 'ETH', 
      source: 'native', 
      logoURI: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' 
    },
    { 
      chain: CHAIN_KINDS.BSC, 
      chainId: 56, 
      address: 'native', 
      name: 'BNB', 
      symbol: 'BNB', 
      source: 'native', 
      logoURI: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' 
    },
    { 
      chain: CHAIN_KINDS.POLYGON, 
      chainId: 137, 
      address: 'native', 
      name: 'Polygon', 
      symbol: 'MATIC', 
      source: 'native', 
      logoURI: 'https://cryptologos.cc/logos/polygon-matic-logo.png' 
    },
    { 
      chain: CHAIN_KINDS.ARBITRUM, 
      chainId: 42161, 
      address: 'native', 
      name: 'Arbitrum', 
      symbol: 'ARB', 
      source: 'native', 
      logoURI: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png' 
    },
    { 
      chain: CHAIN_KINDS.OPTIMISM, 
      chainId: 10, 
      address: 'native', 
      name: 'Optimism', 
      symbol: 'OP', 
      source: 'native', 
      logoURI: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png' 
    },
    { 
      chain: CHAIN_KINDS.BASE, 
      chainId: 8453, 
      address: 'native', 
      name: 'Base', 
      symbol: 'ETH', 
      source: 'native', 
      logoURI: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' 
    },
    { 
      chain: CHAIN_KINDS.AVALANCHE, 
      chainId: 43114, 
      address: 'native', 
      name: 'Avalanche', 
      symbol: 'AVAX', 
      source: 'native', 
      logoURI: 'https://cryptologos.cc/logos/avalanche-avax-logo.png' 
    },
    { 
      chain: CHAIN_KINDS.FANTOM, 
      chainId: 250, 
      address: 'native', 
      name: 'Fantom', 
      symbol: 'FTM', 
      source: 'native', 
      logoURI: 'https://cryptologos.cc/logos/fantom-ftm-logo.png' 
    },
    { 
      chain: CHAIN_KINDS.SOLANA, 
      chainId: null, 
      address: 'native', 
      name: 'Solana', 
      symbol: 'SOL', 
      source: 'native', 
      logoURI: 'https://cryptologos.cc/logos/solana-sol-logo.png' 
    },
    { 
      chain: CHAIN_KINDS.TON, 
      chainId: null, 
      address: 'native', 
      name: 'Toncoin', 
      symbol: 'TON', 
      source: 'native', 
      logoURI: 'https://cryptologos.cc/logos/toncoin-ton-logo.png' 
    },
    { 
      chain: CHAIN_KINDS.TRON, 
      chainId: null, 
      address: 'native', 
      name: 'Tron', 
      symbol: 'TRX', 
      source: 'native', 
      logoURI: 'https://cryptologos.cc/logos/tron-trx-logo.png' 
    },
    { 
      chain: CHAIN_KINDS.NEAR, 
      chainId: null, 
      address: 'native', 
      name: 'NEAR Protocol', 
      symbol: 'NEAR', 
      source: 'native', 
      logoURI: 'https://cryptologos.cc/logos/near-protocol-near-logo.png' 
    },
    { 
      chain: CHAIN_KINDS.SUI, 
      chainId: null, 
      address: 'native', 
      name: 'Sui', 
      symbol: 'SUI', 
      source: 'native', 
      logoURI: 'https://cryptologos.cc/logos/sui-sui-logo.png' 
    },
    { 
      chain: CHAIN_KINDS.APTOS, 
      chainId: null, 
      address: 'native', 
      name: 'Aptos', 
      symbol: 'APT', 
      source: 'native', 
      logoURI: 'https://cryptologos.cc/logos/aptos-apt-logo.png' 
    },
  ];

  console.log(`✅ Native Coins: ${natives.length} coin eklendi`);
  return natives;
}

/* ---------------- Veritabanı İşlemleri ---------------- */
async function saveTokensToDatabase(tokens: TokenData[]): Promise<{
  processed: number;
  created: number;
  updated: number;
  skipped: number;
}> {
  console.log('💾 Veritabanına kaydetme işlemi başlıyor...\n');

  const uniqueTokens = new Map<string, TokenData>();
  
  // Duplicate'leri temizle
  for (const token of tokens) {
    const key = `${token.chain}|${token.address}`;
    if (!uniqueTokens.has(key)) {
      uniqueTokens.set(key, token);
    }
  }

  let processed = 0;
  let created = 0;
  let updated = 0;
  let skipped = 0;

  const uniqueTokenArray = Array.from(uniqueTokens.values());
  const batchSize = 50; // Batch size'ı küçülttük

  for (let i = 0; i < uniqueTokenArray.length; i += batchSize) {
    const batch = uniqueTokenArray.slice(i, i + batchSize);
    
    for (const token of batch) {
      try {
        if (!token.address?.trim() || !token.symbol?.trim() || !token.name?.trim()) {
          skipped++;
          continue;
        }

        const slug = slugify(`${token.symbol}-${token.name}-${token.chain}`, {
          lowercase: true,
          separator: '-',
        });

        const existingToken = await prisma.coin.findUnique({
          where: { slug },
        });

        if (existingToken) {
          await prisma.coin.update({
            where: { slug },
            data: {
              name: token.name.trim(),
              symbol: token.symbol.trim().toUpperCase(),
              logoURI: token.logoURI,
              address: token.address.trim(),
              chainKind: token.chain,
              chainId: token.chainId,
              updatedAt: new Date(),
            },
          });
          updated++;
        } else {
          await prisma.coin.create({
            data: {
              chainKind: token.chain,
              chainId: token.chainId,
              address: token.address.trim(),
              name: token.name.trim(),
              symbol: token.symbol.trim().toUpperCase(),
              logoURI: token.logoURI,
              slug,
              sources: [token.source],
            },
          });
          created++;
        }

        processed++;

        if (processed % 500 === 0) {
          console.log(`⏳ İlerleme: ${processed}/${uniqueTokenArray.length} - Yeni: ${created}, Güncellenen: ${updated}, Atlanan: ${skipped}`);
        }
      } catch (error) {
        skipped++;
        console.warn(`⚠️ Token kayıt hatası (${token.symbol}):`, error instanceof Error ? error.message : error);
      }
    }

    // Batch işlemi sonrası kısa bekleme
    if (i + batchSize < uniqueTokenArray.length) {
      await delay(50);
    }
  }

  return { processed, created, updated, skipped };
}

/* ---------------- ANA FONKSİYON ---------------- */
export async function reindexTokens(): Promise<number> {
  console.log('🚀 GÜVENLİ Token Reindexing Başlıyor...\n');
  console.log(`⏰ Başlangıç zamanı: ${new Date().toLocaleString('tr-TR')}\n`);

  const sources = [
    { name: 'Native Coins', fn: addNativeCoins },
    { name: 'Uniswap Official', fn: fetchUniswapTokens },
    { name: 'PancakeSwap Official', fn: fetchPancakeSwapTokens },
    { name: 'TrustWallet Assets', fn: fetchTrustWalletTokens },
    { name: 'Jupiter Solana', fn: fetchJupiterTokens },
    { name: 'DeFi Protocols', fn: fetchDeFiProtocolTokens },
  ];

  const allTokens: TokenData[] = [];
  let successfulSources = 0;

  for (const source of sources) {
    try {
      console.log(`\n📡 ${source.name} başlatılıyor...`);
      const startTime = Date.now();
      
      const tokens = await source.fn();
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      if (tokens.length > 0) {
        allTokens.push(...tokens);
        successfulSources++;
        console.log(`✅ ${source.name}: ${tokens.length} token (${duration}s)`);
      } else {
        console.log(`⚠️ ${source.name}: Token bulunamadı (${duration}s)`);
      }
      
      // Kaynak arası bekleme
      await delay(1000);
    } catch (error) {
      console.warn(`❌ ${source.name} hatası:`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`\n📊 ÖZET:`);
  console.log(`✅ Başarılı kaynak: ${successfulSources}/${sources.length}`);
  console.log(`📦 Toplam token: ${allTokens.length}`);

  if (allTokens.length === 0) {
    console.log('❌ Hiç token alınamadı. İşlem sonlandırılıyor.');
    return 0;
  }

  // Veritabanına kaydetme
  const dbResult = await saveTokensToDatabase(allTokens);

  console.log('\n🎉 GÜVENLİ REINDEXING TAMAMLANDI!');
  console.log(`⏰ Bitiş zamanı: ${new Date().toLocaleString('tr-TR')}`);
  console.log(`\n📈 SONUÇLAR:`);
  console.log(`✨ Toplam işlenen: ${dbResult.processed}`);
  console.log(`🆕 Yeni eklenen: ${dbResult.created}`);
  console.log(`🔄 Güncellenen: ${dbResult.updated}`);
  console.log(`⏭️ Atlanan: ${dbResult.skipped}`);

  return dbResult.processed;
}

/* ---------------- CLI ---------------- */
if (require.main === module) {
  reindexTokens()
    .then(async (processedCount) => {
      console.log(`\n🎯 BAŞARILI: ${processedCount} token güvenle işlendi`);
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('\n💥 KRİTİK HATA:', error);
      console.error('Stack Trace:', error instanceof Error ? error.stack : 'Bilinmeyen hata');
      await prisma.$disconnect();
      process.exit(1);
    });
}