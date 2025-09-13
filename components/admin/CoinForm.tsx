'use client';
import { useState } from 'react';
import type { ChainKind } from '@prisma/client';

export type CoinInput = {
  name: string;
  symbol: string;
  slug: string;
  chainKind: ChainKind;
  chainId?: number | null;
  address?: string;
  logoURI?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
};

const CHAINS: ChainKind[] = [
  'ETHEREUM','BSC','POLYGON','ARBITRUM','OPTIMISM','BASE','AVALANCHE','FANTOM',
  'GNOSIS','CRONOS','SOLANA','TRON','TON','NEAR','COSMOS','SUI','APTOS',
  'STARKNET','BITCOIN','DOGE','LITECOIN','NATIVE','OTHER',
];

export default function CoinForm({
  initial,
  onSubmit,
}: {
  initial?: Partial<CoinInput>;
  onSubmit: (v: CoinInput) => Promise<void>;
}) {
  const [v, setV] = useState<CoinInput>({
    name: initial?.name ?? '',
    symbol: initial?.symbol ?? '',
    slug: initial?.slug ?? '',
    chainKind: (initial?.chainKind as ChainKind) ?? 'BSC',
    chainId: initial?.chainId ?? undefined,
    address: initial?.address ?? '',
    logoURI: initial?.logoURI ?? '',
    website: initial?.website ?? '',
    twitter: initial?.twitter ?? '',
    telegram: initial?.telegram ?? '',
  });

  function set<K extends keyof CoinInput>(k: K, val: CoinInput[K]) {
    setV((prev) => ({ ...prev, [k]: val }));
  }

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => { e.preventDefault(); await onSubmit(v); }}
    >
      <div className="grid md:grid-cols-2 gap-3">
        <input className="rounded border p-2" placeholder="Name" value={v.name} onChange={(e)=>set('name', e.target.value)} />
        <input className="rounded border p-2" placeholder="Symbol" value={v.symbol} onChange={(e)=>set('symbol', e.target.value)} />
        <input className="rounded border p-2" placeholder="Slug" value={v.slug} onChange={(e)=>set('slug', e.target.value)} />

        <select className="rounded border p-2" value={v.chainKind} onChange={(e)=>set('chainKind', e.target.value as ChainKind)}>
          {CHAINS.map((c)=> <option key={c} value={c}>{c}</option>)}
        </select>
        <input className="rounded border p-2" placeholder="Chain ID (opsiyonel)" type="number"
               value={v.chainId ?? ''} onChange={(e)=>set('chainId', e.target.value ? Number(e.target.value) : undefined)} />

        <input className="rounded border p-2 md:col-span-2" placeholder="Contract address (opsiyonel)"
               value={v.address} onChange={(e)=>set('address', e.target.value)} />

        <input className="rounded border p-2" placeholder="Logo URL" value={v.logoURI} onChange={(e)=>set('logoURI', e.target.value)} />
        <input className="rounded border p-2" placeholder="Website" value={v.website} onChange={(e)=>set('website', e.target.value)} />
        <input className="rounded border p-2" placeholder="Twitter" value={v.twitter} onChange={(e)=>set('twitter', e.target.value)} />
        <input className="rounded border p-2" placeholder="Telegram" value={v.telegram} onChange={(e)=>set('telegram', e.target.value)} />
      </div>

      <button className="rounded bg-primary px-4 py-2 text-black font-medium">Save</button>
    </form>
  );
}
