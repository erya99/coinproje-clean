'use client';
import { useState } from 'react';
import type { ChainKind } from '@prisma/client';

export type CoinInput = {
  name: string;
  symbol: string;
  slug: string;
  chainKind: ChainKind;
  chainId?: number | null;
  address?: string | null;
  logoURI?: string | null; // upload sonrası gelen URL
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
    chainId: initial?.chainId ?? null,
    address: initial?.address ?? '',
    logoURI: initial?.logoURI ?? '',
  });
  const [uploading, setUploading] = useState(false);

  function set<K extends keyof CoinInput>(k: K, val: CoinInput[K]) {
    setV((prev) => ({ ...prev, [k]: val }));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (res.ok && json?.url) {
        set('logoURI', json.url as string);
      } else {
        alert(json?.error || 'Upload failed');
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => { e.preventDefault(); await onSubmit(v); }}
    >
      <div className="grid md:grid-cols-2 gap-3">
        <input className="rounded border p-2" placeholder="Name"
               value={v.name} onChange={(e)=>set('name', e.target.value)} />
        <input className="rounded border p-2" placeholder="Symbol"
               value={v.symbol} onChange={(e)=>set('symbol', e.target.value)} />

        <input className="rounded border p-2" placeholder="Slug"
               value={v.slug} onChange={(e)=>set('slug', e.target.value)} />

        <select className="rounded border p-2" value={v.chainKind}
                onChange={(e)=>set('chainKind', e.target.value as ChainKind)}>
          {CHAINS.map((c)=> <option key={c} value={c}>{c}</option>)}
        </select>

        <input className="rounded border p-2" placeholder="Chain ID (optional)" type="number"
               value={v.chainId ?? ''} onChange={(e)=>set('chainId', e.target.value ? Number(e.target.value) : null)} />

        <input className="rounded border p-2 md:col-span-2" placeholder="Contract address (optional)"
               value={v.address ?? ''} onChange={(e)=>set('address', e.target.value)} />

        {/* Logo upload */}
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {uploading && <span className="text-xs text-muted-foreground">Uploading…</span>}
            {v.logoURI && <span className="text-xs text-muted-foreground">Saved: {v.logoURI}</span>}
          </div>
          {v.logoURI && (
            // Preview
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.logoURI} alt="logo" className="h-12 w-12 rounded-full border" />
          )}
        </div>
      </div>

      <button disabled={uploading}
        className="rounded bg-primary px-4 py-2 text-black font-medium disabled:opacity-50">
        Save
      </button>
    </form>
  );
}
