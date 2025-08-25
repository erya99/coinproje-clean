'use client';

import { useState } from 'react';
import { ChainKind } from '@prisma/client';

export default function SubmitPage() {
  const [pending, setPending] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true); setErr(null);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    const res = await fetch('/api/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
    const j = await res.json();
    setPending(false);
    if (j.ok) { setOk(true); (e.target as HTMLFormElement).reset(); }
    else setErr(j.error || 'Error');
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">Suggest a Coin</h1>
      <p className="text-sm text-muted-foreground">Fill the form below. Admin will review your request.</p>

      <form onSubmit={onSubmit} className="rounded-xl border bg-card p-4 grid gap-3">
        <input name="name" required placeholder="Coin name" className="rounded border px-3 py-2 bg-background" />
        <input name="symbol" required placeholder="Symbol" className="rounded border px-3 py-2 bg-background" />
        <select name="chainKind" className="rounded border px-3 py-2 bg-background">
          {Object.keys(ChainKind).map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <input name="address" placeholder="Contract address (optional)" className="rounded border px-3 py-2 bg-background" />
        <input name="logoURI" placeholder="Logo URL (optional)" className="rounded border px-3 py-2 bg-background" />
        {ok && <p className="text-green-600 text-sm">Thanks! Your request has been submitted.</p>}
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button disabled={pending} className="rounded bg-primary text-primary-foreground px-4 py-2">
          {pending ? 'Sending...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
