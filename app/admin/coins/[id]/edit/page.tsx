import CoinForm from '@/components/admin/CoinForm';

async function getCoin(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/admin/coins/${id}`, { cache: 'no-store' });
  return res.json();
}

export default async function EditCoinPage({ params }: { params: { id: string } }) {
  const coin = await getCoin(params.id);

  async function updateCoin(data: any) {
    'use server';
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/admin/coins/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-xl font-semibold mb-4">Edit Coin</h1>
      <CoinForm initial={coin} onSubmit={updateCoin} />
    </main>
  );
}
