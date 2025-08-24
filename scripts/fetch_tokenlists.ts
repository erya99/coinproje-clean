/* eslint-disable no-console */
import slugify from '@sindresorhus/slugify';
import { ChainKind, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

async function fetchWithRetry<T>(url: string, retries = 3, timeout = 20000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ ${url} - Başarılı (${i + 1}. deneme)`);
      return data;
    } catch (error) {
      console.warn(`⚠️ ${url} - Hata (${i + 1}/${retries}):`, error instanceof Error ? error.message : error);
      if (i === retries - 1) throw error;
      await delay(2000 * (i + 1)); // Exponential backoff
    }
  }
  throw new Error('Max retries reached');
}

function mapChainId(chainId: number): ChainKind | null {
  const mapping: Record<number, ChainKind> = {
    1: CHAIN_KINDS.ETHEREUM,
    56: CHAIN_KINDS.BSC,
    137: CHAIN_KINDS.POLYGON,
    42161: CHAIN_KINDS.ARBITRUM,
    10: CHAIN_KINDS.OPTIMISM,
    8453: CHAIN_KINDS.BASE,
    43114: CHAIN_KINDS.AVALANCHE,
    250: CHAIN_KINDS.FANTOM,
    100: CHAIN_KINDS.GNOSIS,
    25: CHAIN_KINDS.CRONOS,
    42220: CHAIN_KINDS.OTHER, // Celo
    1285: CHAIN_KINDS.OTHER, // Moonriver
    1284: CHAIN_KINDS.OTHER, // Moonbeam
    1666600000: CHAIN_KINDS.OTHER, // Harmony
    128: CHAIN_KINDS.OTHER, // Heco
    66: CHAIN_KINDS.OTHER, // OKEx Chain
    199: CHAIN_KINDS.OTHER, // BitTorrent Chain
    321: CHAIN_KINDS.OTHER, // KCC
    1313161554: CHAIN_KINDS.NEAR, // Aurora (NEAR)
  };
  return mapping[chainId] || null;
}

function validateToken(token: any): boolean {
  return !!(
    token &&
    token.address &&
    typeof token.address === 'string' &&
    token.address.trim().length > 0 &&
    token.address !== '0x0000000000000000000000000000000000000000' &&
    token.name &&
    typeof token.name === 'string' &&
    token.name.trim().length > 0 &&
    token.symbol &&
    typeof token.symbol === 'string' &&
    token.symbol.trim().length > 0 &&
    token.symbol.trim().length < 20 // Çok uzun semboller spam olabilir
  );
}

/* ---------------- 1) ENHANCED UNISWAP - Tüm Listeler ---------------- */
async function fetchUniswapTokens(): Promise<TokenData[]> {
  console.log('🦄 Uniswap - TÜM token listeleri getiriliyor...');
  
  const uniswapLists = [
    'https://gateway.ipfs.io/ipns/tokens.uniswap.org',
    'https://tokens.uniswap.org',
    'https://raw.githubusercontent.com/Uniswap/default-token-list/main/src/tokens/mainnet.json',
    'https://raw.githubusercontent.com/Uniswap/default-token-list/main/src/tokens/arbitrum.json',
    'https://raw.githubusercontent.com/Uniswap/default-token-list/main/src/tokens/optimism.json',
    'https://raw.githubusercontent.com/Uniswap/default-token-list/main/src/tokens/polygon.json',
  ];

  const allTokens: TokenData[] = [];

  for (const url of uniswapLists) {
    try {
      console.log(`📡 Uniswap kaynağı: ${url}`);
      const data = await fetchWithRetry<any>(url);
      
      let tokens: any[] = [];
      if (data.tokens && Array.isArray(data.tokens)) {
        tokens = data.tokens;
      } else if (Array.isArray(data)) {
        tokens = data;
      }

      const validTokens = tokens
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

      allTokens.push(...validTokens);
      console.log(`✅ Uniswap ${new URL(url).hostname}: ${validTokens.length} token`);
      await delay(1000);
    } catch (error) {
      console.warn(`❌ Uniswap ${url}:`, error instanceof Error ? error.message : error);
    }
  }

  return allTokens;
}

/* ---------------- 2) ENHANCED PANCAKESWAP - Daha Fazla Liste ---------------- */
async function fetchPancakeSwapTokens(): Promise<TokenData[]> {
  console.log('🥞 PancakeSwap - TÜM token listeleri getiriliyor...');
  
  const pancakeswapLists = [
    'https://tokens.pancakeswap.finance/pancakeswap-extended.json',
    'https://tokens.pancakeswap.finance/pancakeswap-top-100.json',
    'https://tokens.pancakeswap.finance/pancakeswap-mini.json',
    'https://tokens.pancakeswap.finance/coingecko.json',
    'https://tokens.pancakeswap.finance/cmc.json',
    // BSC için ek listeler
    'https://raw.githubusercontent.com/pancakeswap/pancake-toolkit/master/packages/token-lists/lists/pancakeswap-default.json',
  ];

  const allTokens: TokenData[] = [];

  for (const url of pancakeswapLists) {
    try {
      console.log(`📡 PancakeSwap kaynağı: ${url}`);
      const data = await fetchWithRetry<{ tokens: any[] }>(url);

      if (!data.tokens || !Array.isArray(data.tokens)) {
        console.warn(`⚠️ Geçersiz format: ${url}`);
        continue;
      }

      const validTokens = data.tokens
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

      allTokens.push(...validTokens);
      console.log(`✅ PancakeSwap ${new URL(url).pathname}: ${validTokens.length} token`);
      await delay(800);
    } catch (error) {
      console.warn(`❌ PancakeSwap ${url}:`, error instanceof Error ? error.message : error);
    }
  }

  return allTokens;
}

/* ---------------- 3) ENHANCED TRUSTWALLET - Daha Fazla Chain ---------------- */
async function fetchTrustWalletTokens(): Promise<TokenData[]> {
  console.log('👛 TrustWallet - TÜM blockchain token listeleri...');

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
    { name: 'tron', chainKind: CHAIN_KINDS.TRON, chainId: null },
    { name: 'binance', chainKind: CHAIN_KINDS.BSC, chainId: 56 },
    // Ek zincirler
    { name: 'celo', chainKind: CHAIN_KINDS.OTHER, chainId: 42220 },
    { name: 'moonbeam', chainKind: CHAIN_KINDS.OTHER, chainId: 1284 },
    { name: 'moonriver', chainKind: CHAIN_KINDS.OTHER, chainId: 1285 },
    { name: 'harmony', chainKind: CHAIN_KINDS.OTHER, chainId: 1666600000 },
  ];

  const allTokens: TokenData[] = [];
  
  for (const chain of chains) {
    try {
      const url = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain.name}/tokenlist.json`;
      console.log(`📡 TrustWallet ${chain.name}...`);
      
      const data = await fetchWithRetry<{ tokens: any[] }>(url);

      if (!data.tokens || !Array.isArray(data.tokens)) {
        console.warn(`⚠️ TrustWallet ${chain.name}: Geçersiz format`);
        continue;
      }

      const validTokens = data.tokens
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

      allTokens.push(...validTokens);
      console.log(`✅ TrustWallet ${chain.name}: ${validTokens.length} token`);
      await delay(500);
    } catch (error) {
      console.warn(`❌ TrustWallet ${chain.name}:`, error instanceof Error ? error.message : error);
    }
  }
  
  return allTokens;
}

/* ---------------- 4) ENHANCED JUPITER - Daha Fazla Solana Token ---------------- */
async function fetchJupiterTokens(): Promise<TokenData[]> {
  console.log('🪐 Jupiter - TÜM Solana token listeleri...');
  
  const jupiterUrls = [
    'https://cache.jup.ag/tokens',
    'https://token.jup.ag/all',
    'https://raw.githubusercontent.com/jup-ag/token-list/main/src/tokens/solana.json',
  ];

  const allTokens: TokenData[] = [];

  for (const url of jupiterUrls) {
    try {
      console.log(`📡 Jupiter kaynağı: ${url}`);
      const data = await fetchWithRetry<any>(url);

      let tokens: any[] = [];
      if (Array.isArray(data)) {
        tokens = data;
      } else if (data.tokens && Array.isArray(data.tokens)) {
        tokens = data.tokens;
      }

      const validTokens = tokens
        .filter(validateToken)
        .map((t) => ({
          chain: CHAIN_KINDS.SOLANA,
          chainId: null,
          address: String(t.address || t.mint).trim(), // Jupiter sometimes uses 'mint'
          name: String(t.name).trim(),
          symbol: String(t.symbol).trim().toUpperCase(),
          logoURI: t.logoURI || t.image || null,
          source: 'jupiter-official',
        })) satisfies TokenData[];

      allTokens.push(...validTokens);
      console.log(`✅ Jupiter ${new URL(url).hostname}: ${validTokens.length} token`);
      await delay(800);
    } catch (error) {
      console.warn(`❌ Jupiter ${url}:`, error instanceof Error ? error.message : error);
    }
  }

  return allTokens;
}

/* ---------------- 5) ENHANCED DEFI - Çok Daha Fazla Protocol ---------------- */
async function fetchDeFiProtocolTokens(): Promise<TokenData[]> {
  console.log('🏦 DeFi - TÜM protokol token listeleri...');
  
  const sources = [
    { name: 'Compound', url: 'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json', source: 'compound-official' },
    { name: 'Aave', url: 'https://tokenlist.aave.eth.link', source: 'aave-official' },
    { name: 'SushiSwap', url: 'https://token-list.sushi.com', source: 'sushiswap-official' },
    { name: '1inch', url: 'https://gateway.ipfs.io/ipns/tokens.1inch.eth', source: '1inch-official' },
    { name: 'Curve', url: 'https://raw.githubusercontent.com/curvefi/curve-assets/main/platforms/ethereum.json', source: 'curve-official' },
    { name: 'Yearn', url: 'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/ethereum.json', source: 'yearn-official' },
    // Büyük liste aggregator'ları
    { name: 'CoinGecko', url: 'https://tokens.coingecko.com/uniswap/all.json', source: 'coingecko' },
    { name: 'Kleros T2CR', url: 'https://t2crtokens.eth.link', source: 'kleros-t2cr' },
    { name: 'Gemini', url: 'https://www.gemini.com/uniswap/manifest.json', source: 'gemini-official' },
    { name: 'Set Protocol', url: 'https://raw.githubusercontent.com/SetProtocol/uniswap-tokenlist/main/set.tokenlist.json', source: 'setprotocol-official' },
    // Çoklu zincir listeleri
    { name: 'Multichain Bridge', url: 'https://bridgeapi.anyswap.exchange/v2/serverInfo/all', source: 'multichain-bridge' },
  ];

  const allTokens: TokenData[] = [];
  
  for (const src of sources) {
    try {
      console.log(`📡 ${src.name}...`);
      const data = await fetchWithRetry<any>(src.url);

      let tokens: any[] = [];
      
      // Farklı formatları handle et
      if (data.tokens && Array.isArray(data.tokens)) {
        tokens = data.tokens;
      } else if (Array.isArray(data)) {
        tokens = data;
      } else if (data.result && Array.isArray(data.result)) {
        tokens = data.result;
      } else if (data.data && Array.isArray(data.data)) {
        tokens = data.data;
      }

      const validTokens = tokens
        .filter(validateToken)
        .map((t) => {
          const chain = mapChainId(t.chainId);
          if (!chain && src.name !== 'Multichain Bridge') return null;
          
          return {
            chain: chain || CHAIN_KINDS.OTHER,
            chainId: t.chainId || null,
            address: String(t.address).toLowerCase().trim(),
            name: String(t.name).trim(),
            symbol: String(t.symbol).trim().toUpperCase(),
            logoURI: t.logoURI || t.image || null,
            source: src.source,
          } as TokenData;
        })
        .filter((t): t is TokenData => t !== null);

      allTokens.push(...validTokens);
      console.log(`✅ ${src.name}: ${validTokens.length} token`);
      await delay(1200); // DeFi protokolleri için daha uzun bekleme
    } catch (error) {
      console.warn(`❌ ${src.name}:`, error instanceof Error ? error.message : error);
    }
  }
  
  return allTokens;
}

/* ---------------- 6) YENİ: CoinGecko ve CoinMarketCap Listeleri ---------------- */
async function fetchMajorTokenLists(): Promise<TokenData[]> {
  console.log('🎯 Büyük token listeleri (CoinGecko, CMC vb.)...');
  
  const majorSources = [
    // En popüler tokenler
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1',
    'https://tokens.coingecko.com/ethereum/all.json',
    'https://tokens.coingecko.com/binance-smart-chain/all.json',
    'https://tokens.coingecko.com/polygon-pos/all.json',
    'https://tokens.coingecko.com/arbitrum-one/all.json',
    'https://tokens.coingecko.com/optimistic-ethereum/all.json',
    'https://tokens.coingecko.com/avalanche/all.json',
    'https://tokens.coingecko.com/fantom/all.json',
    'https://tokens.coingecko.com/solana/all.json',
  ];

  const allTokens: TokenData[] = [];

  for (const url of majorSources) {
    try {
      console.log(`📡 Token listesi: ${url}`);
      const data = await fetchWithRetry<any>(url);
      
      let tokens: any[] = [];
      if (Array.isArray(data)) {
        tokens = data;
      } else if (data.tokens && Array.isArray(data.tokens)) {
        tokens = data.tokens;
      }

      for (const token of tokens) {
        try {
          let chain: ChainKind | null = null;
          let chainId: number | null = null;
          let address = '';

          // CoinGecko market data formatı
          if (token.platforms) {
            for (const [platform, addr] of Object.entries(token.platforms)) {
              if (!addr || addr === '') continue;
              
              switch (platform) {
                case 'ethereum':
                  chain = CHAIN_KINDS.ETHEREUM;
                  chainId = 1;
                  break;
                case 'binance-smart-chain':
                  chain = CHAIN_KINDS.BSC;
                  chainId = 56;
                  break;
                case 'polygon-pos':
                  chain = CHAIN_KINDS.POLYGON;
                  chainId = 137;
                  break;
                case 'arbitrum-one':
                  chain = CHAIN_KINDS.ARBITRUM;
                  chainId = 42161;
                  break;
                case 'optimistic-ethereum':
                  chain = CHAIN_KINDS.OPTIMISM;
                  chainId = 10;
                  break;
                case 'avalanche':
                  chain = CHAIN_KINDS.AVALANCHE;
                  chainId = 43114;
                  break;
                case 'fantom':
                  chain = CHAIN_KINDS.FANTOM;
                  chainId = 250;
                  break;
                case 'solana':
                  chain = CHAIN_KINDS.SOLANA;
                  chainId = null;
                  break;
              }
              
              if (chain) {
                address = String(addr).toLowerCase().trim();
                break;
              }
            }
          } 
          // Normal token listesi formatı
          else if (token.chainId && token.address) {
            chain = mapChainId(token.chainId);
            chainId = token.chainId;
            address = String(token.address).toLowerCase().trim();
          }

          if (!chain || !address || !token.name || !token.symbol) continue;

          allTokens.push({
            chain,
            chainId,
            address,
            name: String(token.name).trim(),
            symbol: String(token.symbol).trim().toUpperCase(),
            logoURI: token.logoURI || token.image || null,
            source: 'coingecko-major',
          });

        } catch (err) {
          // Tek token hatası tüm listeyi bozmasın
          continue;
        }
      }

      console.log(`✅ Token listesi işlendi: ${url.includes('coingecko.com/api') ? 'CoinGecko API' : new URL(url).pathname}`);
      await delay(2000); // CoinGecko API rate limit
    } catch (error) {
      console.warn(`❌ Token listesi ${url}:`, error instanceof Error ? error.message : error);
    }
  }

  return allTokens;
}

/* ---------------- 7) Native Coins (Güncellenmiş) ---------------- */
async function addNativeCoins(): Promise<TokenData[]> {
  console.log("💎 Native coin'ler ekleniyor...");
  
  const natives: TokenData[] = [
    { chain: CHAIN_KINDS.BITCOIN, chainId: null, address: 'native', name: 'Bitcoin', symbol: 'BTC', source: 'native', logoURI: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
    { chain: CHAIN_KINDS.ETHEREUM, chainId: 1, address: 'native', name: 'Ethereum', symbol: 'ETH', source: 'native', logoURI: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
    { chain: CHAIN_KINDS.BSC, chainId: 56, address: 'native', name: 'BNB', symbol: 'BNB', source: 'native', logoURI: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' },
    { chain: CHAIN_KINDS.POLYGON, chainId: 137, address: 'native', name: 'Polygon', symbol: 'MATIC', source: 'native', logoURI: 'https://cryptologos.cc/logos/polygon-matic-logo.png' },
    { chain: CHAIN_KINDS.ARBITRUM, chainId: 42161, address: 'native', name: 'Arbitrum', symbol: 'ARB', source: 'native', logoURI: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png' },
    { chain: CHAIN_KINDS.OPTIMISM, chainId: 10, address: 'native', name: 'Optimism', symbol: 'OP', source: 'native', logoURI: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png' },
    { chain: CHAIN_KINDS.BASE, chainId: 8453, address: 'native', name: 'Base', symbol: 'ETH', source: 'native', logoURI: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
    { chain: CHAIN_KINDS.AVALANCHE, chainId: 43114, address: 'native', name: 'Avalanche', symbol: 'AVAX', source: 'native', logoURI: 'https://cryptologos.cc/logos/avalanche-avax-logo.png' },
    { chain: CHAIN_KINDS.FANTOM, chainId: 250, address: 'native', name: 'Fantom', symbol: 'FTM', source: 'native', logoURI: 'https://cryptologos.cc/logos/fantom-ftm-logo.png' },
    { chain: CHAIN_KINDS.SOLANA, chainId: null, address: 'native', name: 'Solana', symbol: 'SOL', source: 'native', logoURI: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
    { chain: CHAIN_KINDS.TON, chainId: null, address: 'native', name: 'Toncoin', symbol: 'TON', source: 'native', logoURI: 'https://cryptologos.cc/logos/toncoin-ton-logo.png' },
    { chain: CHAIN_KINDS.TRON, chainId: null, address: 'native', name: 'Tron', symbol: 'TRX', source: 'native', logoURI: 'https://cryptologos.cc/logos/tron-trx-logo.png' },
    { chain: CHAIN_KINDS.NEAR, chainId: null, address: 'native', name: 'NEAR Protocol', symbol: 'NEAR', source: 'native', logoURI: 'https://cryptologos.cc/logos/near-protocol-near-logo.png' },
    { chain: CHAIN_KINDS.SUI, chainId: null, address: 'native', name: 'Sui', symbol: 'SUI', source: 'native', logoURI: 'https://cryptologos.cc/logos/sui-sui-logo.png' },
    { chain: CHAIN_KINDS.APTOS, chainId: null, address: 'native', name: 'Aptos', symbol: 'APT', source: 'native', logoURI: 'https://cryptologos.cc/logos/aptos-apt-logo.png' },
  ];

  return natives;
}

/* ---------------- ENHANCED Database Operations ---------------- */
async function saveTokensToDatabase(tokens: TokenData[]): Promise<{
  processed: number;
  created: number;
  updated: number;
  skipped: number;
}> {
  console.log('💾 Veritabanına kaydetme işlemi başlıyor...\n');

  // Advanced deduplication
  const uniqueTokens = new Map<string, TokenData>();
  
  for (const token of tokens) {
    // Daha akıllı unique key
    const normalizedAddress = token.address.toLowerCase().trim();
    const key = `${token.chain}|${normalizedAddress}`;
    
    if (!uniqueTokens.has(key) || token.source.includes('official')) {
      // Official kaynaklara öncelik ver
      uniqueTokens.set(key, token);
    }
  }

  console.log(`📊 Deduplication: ${tokens.length} -> ${uniqueTokens.size} unique token`);

  let processed = 0;
  let created = 0;
  let updated = 0;
  let skipped = 0;

  const uniqueTokenArray = Array.from(uniqueTokens.values());
  const batchSize = 50;

  console.log(`🔄 ${uniqueTokenArray.length} token işlenmeye başlıyor...\n`);

  for (let i = 0; i < uniqueTokenArray.length; i += batchSize) {
    const batch = uniqueTokenArray.slice(i, i + batchSize);
    
    for (const token of batch) {
      try {
        if (!token.address?.trim() || !token.symbol?.trim() || !token.name?.trim()) {
          skipped++;
          continue;
        }

        // Daha iyi slug oluşturma
        const slugBase = `${token.symbol}-${token.chain}`;
        let slug = slugify(slugBase, { lowercase: true, separator: '-' });
        
        // Slug çakışmasını önle
        let counter = 0;
        let finalSlug = slug;
        while (counter < 10) { // Max 10 deneme
          const existing = await prisma.coin.findUnique({
            where: { slug: finalSlug },
          });
          
          if (!existing || (existing.chainKind === token.chain && existing.address === token.address.trim())) {
            break;
          }
          
          counter++;
          finalSlug = `${slug}-${counter}`;
        }

        const existingToken = await prisma.coin.findFirst({
          where: {
            chainKind: token.chain,
            address: token.address.trim(),
          },
        });

        if (existingToken) {
          await prisma.coin.update({
            where: { id: existingToken.id },
            data: {
              name: token.name.trim(),
              symbol: token.symbol.trim().toUpperCase(),
              logoURI: token.logoURI || existingToken.logoURI, // Mevcut logoURI'yi koru
              slug: finalSlug,
              chainId: token.chainId,
              updatedAt: new Date(),
              // Sources array'ini güncelle
              sources: existingToken.sources.includes(token.source) 
                ? existingToken.sources 
                : [...existingToken.sources, token.source],
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
              slug: finalSlug,
              sources: [token.source],
            },
          });
          created++;
        }

        processed++;

        if (processed % 250 === 0) {
          const progress = ((processed / uniqueTokenArray.length) * 100).toFixed(1);
          console.log(`⏳ İlerleme: ${progress}% (${processed}/${uniqueTokenArray.length}) - Yeni: ${created}, Güncellenen: ${updated}, Atlanan: ${skipped}`);
        }
      } catch (error) {
        skipped++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (!errorMsg.includes('Unique constraint')) {
          console.warn(`⚠️ Token kayıt hatası (${token.symbol}): ${errorMsg}`);
        }
      }
    }

    // Batch arası kısa bekleme
    if (i + batchSize < uniqueTokenArray.length) {
      await delay(25);
    }
  }

  return { processed, created, updated, skipped };
}

/* ---------------- MAIN FUNCTION - ENHANCED ---------------- */
export async function reindexTokens(): Promise<number> {
  console.log('🚀 ENHANCED Token Reindexing - MAKSIMUM TOKEN TOPLAMA\n');
  console.log(`⏰ Başlangıç: ${new Date().toLocaleString('tr-TR')}\n`);

  const sources = [
    { name: 'Native Coins', fn: addNativeCoins, priority: 1 },
    { name: 'Major Token Lists (CoinGecko)', fn: fetchMajorTokenLists, priority: 2 },
    { name: 'Uniswap (All Lists)', fn: fetchUniswapTokens, priority: 3 },
    { name: 'PancakeSwap (All Lists)', fn: fetchPancakeSwapTokens, priority: 4 },
    { name: 'TrustWallet (All Chains)', fn: fetchTrustWalletTokens, priority: 5 },
    { name: 'Jupiter (All Solana)', fn: fetchJupiterTokens, priority: 6 },
    { name: 'DeFi Protocols (Extended)', fn: fetchDeFiProtocolTokens, priority: 7 },
  ];

  const allTokens: TokenData[] = [];
  const sourceResults: Record<string, number> = {};
  let successfulSources = 0;

  // Paralel olarak kaynak toplama (3'lü gruplar halinde)
  for (let i = 0; i < sources.length; i += 3) {
    const batch = sources.slice(i, i + 3);
    
    const batchPromises = batch.map(async (source) => {
      try {
        console.log(`\n📡 ${source.name} başlatılıyor... (Öncelik: ${source.priority})`);
        const startTime = Date.now();
        
        const tokens = await source.fn();
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        sourceResults[source.name] = tokens.length;
        
        if (tokens.length > 0) {
          successfulSources++;
          console.log(`✅ ${source.name}: ${tokens.length} token (${duration}s)`);
          return tokens;
        } else {
          console.log(`⚠️ ${source.name}: Token bulunamadı (${duration}s)`);
          return [];
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.warn(`❌ ${source.name} hatası: ${errorMsg}`);
        sourceResults[source.name] = 0;
        return [];
      }
    });

    // Batch'teki tüm promise'leri bekle
    const batchResults = await Promise.allSettled(batchPromises);
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        allTokens.push(...result.value);
      }
    }

    // Batch arası bekleme
    if (i + 3 < sources.length) {
      console.log(`\n⏸️ Batch tamamlandı, 3 saniye bekleniyor...\n`);
      await delay(3000);
    }
  }

  // Detaylı rapor
  console.log(`\n📊 DETAYLI KAYNAK RAPORU:`);
  console.log(`${'='.repeat(50)}`);
  for (const [sourceName, tokenCount] of Object.entries(sourceResults)) {
    const status = tokenCount > 0 ? '✅' : '❌';
    console.log(`${status} ${sourceName.padEnd(30)} ${tokenCount.toLocaleString()} token`);
  }
  console.log(`${'='.repeat(50)}`);
  console.log(`✅ Başarılı kaynak: ${successfulSources}/${sources.length}`);
  console.log(`📦 TOPLAM HAMDATA: ${allTokens.length.toLocaleString()} token`);

  if (allTokens.length === 0) {
    console.log('❌ Hiç token alınamadı. Ağ bağlantısını ve API erişimini kontrol edin.');
    return 0;
  }

  // Chain bazında dağılım raporu
  const chainDistribution: Record<string, number> = {};
  for (const token of allTokens) {
    chainDistribution[token.chain] = (chainDistribution[token.chain] || 0) + 1;
  }

  console.log(`\n🔗 CHAIN BAZINDA DAĞILIM:`);
  console.log(`${'='.repeat(40)}`);
  for (const [chain, count] of Object.entries(chainDistribution).sort(([,a], [,b]) => b - a)) {
    console.log(`${chain.padEnd(20)} ${count.toLocaleString()} token`);
  }
  console.log(`${'='.repeat(40)}`);

  // Veritabanına kaydetme
  console.log(`\n💾 Veritabanına kaydetme başlıyor...\n`);
  const dbResult = await saveTokensToDatabase(allTokens);

  // Final rapor
  console.log('\n🎉 ENHANCED REINDEXING TAMAMLANDI!');
  console.log(`⏰ Bitiş: ${new Date().toLocaleString('tr-TR')}`);
  console.log(`\n📈 FINAL SONUÇLAR:`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📊 Ham veri toplam:        ${allTokens.length.toLocaleString()} token`);
  console.log(`🔄 Benzersiz token:        ${dbResult.processed.toLocaleString()} token`);
  console.log(`🆕 Yeni eklenen:          ${dbResult.created.toLocaleString()} token`);
  console.log(`🔄 Güncellenen:           ${dbResult.updated.toLocaleString()} token`);
  console.log(`⏭️ Atlanan/Hatalı:        ${dbResult.skipped.toLocaleString()} token`);
  console.log(`✅ Başarı oranı:          ${(((dbResult.created + dbResult.updated) / dbResult.processed) * 100).toFixed(1)}%`);
  console.log(`${'='.repeat(60)}`);

  if (dbResult.created + dbResult.updated < 5000) {
    console.log(`\n⚠️ UYARI: ${dbResult.created + dbResult.updated} token az görünüyor.`);
    console.log(`🔍 Muhtemel sebepler:`);
    console.log(`   • API rate limiting`);
    console.log(`   • Ağ bağlantı sorunları`);
    console.log(`   • Bazı kaynaklar geçici olarak erişilemez`);
    console.log(`   • Duplicate tokenler filtrelendi`);
    console.log(`\n💡 Öneriler:`);
    console.log(`   • Birkaç dakika sonra tekrar çalıştırın`);
    console.log(`   • VPN kullanarak farklı lokasyondan deneyin`);
    console.log(`   • Logları kontrol ederek hangi kaynakların başarısız olduğunu görün`);
  } else {
    console.log(`\n🎯 MÜKEMMEL! ${dbResult.created + dbResult.updated} token başarıyla işlendi.`);
  }

  return dbResult.processed;
}

/* ---------------- CLI ---------------- */
if (require.main === module) {
  reindexTokens()
    .then(async (processedCount) => {
      console.log(`\n🏆 MİSYON TAMAMLANDI: ${processedCount.toLocaleString()} token güvenle işlendi`);
      console.log(`🚀 Veritabanınız artık binlerce tokenle dolu!`);
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('\n💥 KRİTİK HATA:');
      console.error('🔍 Hata detayı:', error instanceof Error ? error.message : error);
      console.error('📍 Stack trace:', error instanceof Error ? error.stack : 'Bilinmeyen hata');
      
      console.log('\n🛠️ HATA GİDERME ÖNERİLERİ:');
      console.log('1. Internet bağlantınızı kontrol edin');
      console.log('2. VPN kullanıyorsanız kapatmayı deneyin');
      console.log('3. Birkaç dakika sonra tekrar çalıştırın');
      console.log('4. Prisma veritabanı bağlantınızı kontrol edin: npx prisma studio');
      
      await prisma.$disconnect();
      process.exit(1);
    });
}