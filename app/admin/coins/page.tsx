/* PATH: app/admin/coins/page.tsx */
'use client';

import { useState } from 'react';
import { CHAIN_KEYS } from '@/lib/chains';

export default function AdminCoinsPage() {
  const [pending, setPending] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Add a Coin</h1>

      {ok && <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm">Saved ✓</div>}
      {err && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm">{err}</div>}

      {/* DİKKAT: doğru action /api/admin/coins */}
      <form
        action="/api/admin/coins"
        method="post"
        encType="multipart/form-data"
        className="space-y-4"
        onSubmit={() => { setPending(true); setOk(null); setErr(null); }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name"  placeholder="Name"   className="input" required />
          <input name="symbol" placeholder="Symbol" className="input" required />
          <select name="chainKind" className="input" required>
            <option value="">Select chain</option>
            {CHAIN_KEYS.map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <input name="address" placeholder="Address (optional)" className="input" />
        </div>

        {/* Logo dosyası yükleme */}
        <div>
          <input type="file" name="logo" accept="image/*" />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save'}
        </button>
      </form>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--border);
          background: var(--card);
          padding: 0.5rem 0.75rem;
          outline: none;
        }
      `}</style>
    </div>
  );
}
