'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VoteButton({ coinId }: { coinId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onVote() {
    try {
      setLoading(true);
      setErr(null);

      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ coinId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Voting failed');

      setOk(true);
      // ✅ bulunduğun sayfayı ve cache’i tazele
      router.refresh();
      // istersen direkt ana sayfaya dön:
      // router.push('/');
    } catch (e: any) {
      setErr(e.message || 'Hata');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={onVote}
        disabled={loading || ok}
        className="w-full rounded-xl border border-border bg-card text-foreground
                   hover:bg-muted transition px-4 py-3 font-medium disabled:opacity-60"
      >
        {loading ? 'Loading...' : ok ? 'Vote recorded ✓' : 'Vote'}
      </button>
      {err && <p className="mt-2 text-xs text-red-400" role="alert">{err}</p>}
    </div>
  );
}
