'use client';
import { useEffect, useState } from 'react';
import CoinForm from '@/components/admin/CoinForm';

export default function EditCoinPage({ params }: { params: { id: string } }) {
  const [coin, setCoin] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/admin/coins/${params.id}`, { cache: 'no-store' });
      const json = await res.json();
      setCoin(json);
    })();
  }, [params.id]);

  if (!coin) return <main className="mx-auto max-w-3xl p-6">Loading…</main>;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-xl font-semibold mb-4">Edit Coin</h1>
      <CoinForm mode="edit" id={params.id} initial={coin} />
    </main>
  );
}
