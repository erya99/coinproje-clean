'use client';

import { useState } from 'react';

export default function AdminCoinsPage() {
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Add Coin</h1>

      {msg && (
        <div className="rounded-md border border-border bg-card p-3 text-sm">
          {msg}
        </div>
      )}

      <form
        className="space-y-3"
        action="/admin/api/coins"
        method="post"
        encType="multipart/form-data"
        onSubmit={() => {
          setPending(true);
          setMsg(null);
        }}
      >
        <div className="grid gap-2">
          <label className="text-sm">Name</label>
          <input name="name" required className="rounded border border-border bg-background p-2" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Symbol</label>
          <input name="symbol" required className="rounded border border-border bg-background p-2" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Chain</label>
          <select name="chainKind" required className="rounded border border-border bg-background p-2">
            {[
              'ETHEREUM','BSC','POLYGON','ARBITRUM','OPTIMISM','BASE','AVALANCHE','FANTOM',
              'GNOSIS','CRONOS','SOLANA','TRON','TON','NEAR','COSMOS','SUI','APTOS','STARKNET',
              'BITCOIN','DOGE','LITECOIN','NATIVE','OTHER'
            ].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Address (optional)</label>
          <input name="address" className="rounded border border-border bg-background p-2" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Logo (file upload)</label>
          <input type="file" name="logo" accept="image/*" className="rounded border border-border bg-background p-2" />
        </div>

        <button
          disabled={pending}
          className="rounded bg-primary px-4 py-2 text-white disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  );
}
