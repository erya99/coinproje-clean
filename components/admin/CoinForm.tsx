'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ChainKind } from '@prisma/client';

export type CoinInput = {
  name: string;
  symbol: string;
  chainKind: ChainKind;
  chainId?: number | null;
  address?: string | null;
  logoURI?: string | null;
};

const CHAINS: ChainKind[] = [
  'ETHEREUM','BSC','POLYGON','ARBITRUM','OPTIMISM','BASE','AVALANCHE','FANTOM',
  'GNOSIS','CRONOS','SOLANA','TRON','TON','NEAR','COSMOS','SUI','APTOS',
  'STARKNET','BITCOIN','DOGE','LITECOIN','NATIVE','OTHER',
];

export default function CoinForm({
  initial,
  mode, // 'create' | 'edit'
  id,   // edit'te gerekli
}: {
  initial?: Partial<CoinInput>;
  mode: 'create' | 'edit';
  id?: string;
}) {
  const router = useRouter();
  const [v, setV] = useState<CoinInput>({
    name: initial?.name ?? '',
    symbol: initial?.symbol ?? '',
    chainKind: (initial?.chainKind as ChainKind) ?? 'BSC',
    chainId: initial?.chainId ?? null,
    address: initial?.address ?? '',
    logoURI: initial?.logoURI ?? '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  async function submit() {
    setSaving(true);
    try {
      const payload = { ...v };
      const url = mode === 'create' ? '/api/admin/coins' : `/api/admin/coins/${id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Request failed');
      }
      router.push('/admin/coins');
      router.refresh();
    } catch (e: any) {
      alert(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={(e)=>{ e.preventDefault(); submit(); }}>
      <div className="grid md:grid-cols-2 gap-3">
        <input className="rounded border p-2" placeholder="Name"
               value={v.name} onChange={(e)=>set('name', e.target.value)} />
        <input className="rounded border p-2" placeholder="Symbol"
               value={v.symbol} onChange={(e)=>set('symbol', e.target.value)} />

        <select className="rounded border p-2" value={v.chainKind}
                onChange={(e)=>set('chainKind', e.target.value as ChainKind)}>
          {CHAINS.map((c)=> <option key={c} value={c}>{c}</option>)}
        </select>

        <input className="rounded border p-2" placeholder="Chain ID (optional)" type="number"
               value={v.chainId ?? ''} onChange={(e)=>set('chainId', e.target.value ? Number(e.target.value) : null)} />

        <input className="rounded border p-2 md:col-span-2" placeholder="Contract address (optional)"
               value={v.address ?? ''} onChange={(e)=>set('address', e.target.value)} />

        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {uploading && <span className="text-xs text-muted-foreground">Uploading…</span>}
            {v.logoURI && <span className="text-xs text-muted-foreground">Saved: {v.logoURI}</span>}
          </div>
          {v.logoURI && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.logoURI} alt="logo" className="h-12 w-12 rounded-full border" />
          )}
        </div>
      </div>

      <button
        disabled={uploading || saving}
        className="rounded bg-primary px-4 py-2 text-black font-medium disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}
