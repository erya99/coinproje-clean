'use client';

import { useState } from 'react';
import { CHAIN_KEYS, CHAINS } from '@/lib/chains';

export default function AdminCoinsPage() {
  const [pending, setPending] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Add a Coin</h1>

      {ok && <div className="rounded bg-green-600/10 border border-green-600/30 p-3">Saved</div>}
      {err && <div className="rounded bg-red-600/10 border border-red-600/30 p-3">{err}</div>}

      <form
        // DOĞRU URL: /api/admin/coins  (YANLIŞ: /admin/api/coins)
        action="/api/admin/coins"
        method="post"
        encType="multipart/form-data"
        onSubmit={() => { setPending(true); setOk(null); setErr(null); }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" placeholder="Name" className="input" required />
          <input name="symbol" placeholder="Symbol" className="input" required />
          <select name="chainKind" className="input" required>
            <option value="">Select chain</option>
            {Object.keys(CHAINS).map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <input name="address" placeholder="(optional) Address" className="input" />
        </div>

        {/* Logo dosyası yükleme */}
        <div>
          <label className="block text-sm mb-1">Logo (PNG/JPG, opsiyonel)</label>
          <input type="file" name="logo" accept="image/*" className="block" />
        </div>

        <button disabled={pending} className="btn">
          {pending ? 'Saving…' : 'Save'}
        </button>
      </form>

      <style jsx>{`
        .input { width:100%; padding:.6rem .8rem; border:1px solid var(--border); border-radius:.5rem; background:var(--card); }
        .btn { padding:.6rem 1rem; border-radius:.5rem; background:var(--primary); color:white; }
      `}</style>
    </div>
  );
}
