'use client';

import { useState } from 'react';
import { ChainKind } from '@prisma/client';
import { absUrl } from '@/lib/abs-url';

export default function NewCoinForm() {
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true); setErr(null);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    const res = await fetch(absUrl('/api/admin/coins'), {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
    const j = await res.json();
    setPending(false);
    if (j.ok) {
      (e.target as HTMLFormElement).reset();
      location.reload();
    } else {
      setErr(j.error || 'Error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border bg-card p-4 grid gap-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input name="name" required placeholder="Name" className="rounded border px-3 py-2 bg-background" />
        <input name="symbol" required placeholder="Symbol" className="rounded border px-3 py-2 bg-background" />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <select name="chainKind" className="rounded border px-3 py-2 bg-background">
          {Object.keys(ChainKind).map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <input name="address" placeholder="Address (optional)" className="rounded border px-3 py-2 bg-background" />
      </div>
      <input name="logoURI" placeholder="Logo URL" className="rounded border px-3 py-2 bg-background" />
      {err && <p className="text-sm text-red-500">{err}</p>}
      <button disabled={pending} className="rounded bg-primary text-primary-foreground px-4 py-2">
        {pending ? 'Saving...' : 'Add Coin'}
      </button>
    </form>
  );
}
