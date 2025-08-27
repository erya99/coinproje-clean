'use client';

import { useState } from 'react';
import { ChainKind } from '@prisma/client';

export default function SubmitPage() {
  const [pending, setPending] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErr(null);
    setOk(false);

    try {
      const fd = new FormData(e.currentTarget);

      // 👇 Doğru endpoint (tekil) ve FormData gönderimi
      const res = await fetch('/api/request', {
        method: 'POST',
        body: fd,
        // NOT: FormData için Content-Type set ETME!
      });

      // Response JSON değilse de yakalayalım
      let data: any = null;
      const text = await res.text();
      try { data = JSON.parse(text); } catch { /* noop */ }

      if (!res.ok || !data?.ok) {
        const msg = data?.error || `Request failed (${res.status})`;
        throw new Error(msg);
      }

      setOk(true);
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      setErr(error?.message || 'Unexpected error');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">Suggest a Coin</h1>
      <p className="text-sm text-muted-foreground">
        Fill the form below. Admin will review your request.
      </p>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border bg-card p-4">
        <input
          name="name"
          required
          placeholder="Coin name"
          className="rounded border bg-background px-3 py-2"
        />
        <input
          name="symbol"
          required
          placeholder="Symbol"
          className="rounded border bg-background px-3 py-2"
        />
        <select
          name="chainKind"
          className="rounded border bg-background px-3 py-2"
          defaultValue="ETHEREUM"
        >
          {Object.keys(ChainKind).map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <input
          name="address"
          placeholder="Contract address (optional)"
          className="rounded border bg-background px-3 py-2"
        />
        <input
          name="logoURI"
          placeholder="Logo URL (optional)"
          className="rounded border bg-background px-3 py-2"
        />

        {ok && (
          <p className="text-sm text-emerald-500">
            Thanks! Your request has been submitted.
          </p>
        )}
        {err && (
          <p className="text-sm text-red-500">
            {err}
          </p>
        )}

        <button
          disabled={pending}
          className="rounded bg-primary px-4 py-2 text-primary-foreground disabled:opacity-60"
        >
          {pending ? 'Sending…' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
