/* PATH: lib/chains.ts */

export const CHAINS = {
  ETHEREUM:  { label: 'Ethereum',            icon: '/chains/eth.svg' },
  BSC:       { label: 'BNB Smart Chain',     icon: '/chains/bsc.svg' },
  POLYGON:   { label: 'Polygon',             icon: '/chains/polygon.svg' },
  ARBITRUM:  { label: 'Arbitrum',            icon: '/chains/arbitrum.svg' },
  OPTIMISM:  { label: 'Optimism',            icon: '/chains/optimism.svg' },
  BASE:      { label: 'Base',                icon: '/chains/base.svg' },
  AVALANCHE: { label: 'Avalanche',           icon: '/chains/avax.svg' },
  FANTOM:    { label: 'Fantom',              icon: '/chains/fantom.svg' },
  GNOSIS:    { label: 'Gnosis',              icon: '/chains/gnosis.svg' },
  CRONOS:    { label: 'Cronos',              icon: '/chains/cronos.svg' },
  SOLANA:    { label: 'Solana',              icon: '/chains/sol.svg' },
  TRON:      { label: 'TRON',                icon: '/chains/tron.svg' },
  TON:       { label: 'TON',                 icon: '/chains/ton.svg' },
  NEAR:      { label: 'NEAR',                icon: '/chains/near.svg' },
  COSMOS:    { label: 'Cosmos',              icon: '/chains/cosmos.svg' },
  SUI:       { label: 'Sui',                 icon: '/chains/sui.svg' },
  APTOS:     { label: 'Aptos',               icon: '/chains/aptos.svg' },
  STARKNET:  { label: 'Starknet',            icon: '/chains/starknet.svg' },
  BITCOIN:   { label: 'Bitcoin',             icon: '/chains/btc.svg' },
  DOGE:      { label: 'Dogecoin',            icon: '/chains/doge.svg' },
  LITECOIN:  { label: 'Litecoin',            icon: '/chains/ltc.svg' },
  NATIVE:    { label: 'Native',              icon: '/chains/native.svg' },
  OTHER:     { label: 'Other',               icon: '/chains/other.svg' },
} as const;

export type ChainKey = keyof typeof CHAINS;

// Select için key listesi:
export const CHAIN_KEYS: ChainKey[] = Object.keys(CHAINS) as ChainKey[];

// İstersen default export da mevcut olsun:
export default CHAINS;
