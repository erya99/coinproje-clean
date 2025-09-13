import Link from 'next/link';

async function getCoins() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/admin/coins`, { cache: 'no-store' });
  return res.json();
}

export default async function CoinsPage() {
  const coins = await getCoins();

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Coins</h1>
        <Link href="/admin/coins/new" className="rounded bg-primary px-3 py-2 text-black font-medium">Add New</Link>
      </div>
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2">Symbol</th>
              <th className="p-2">Chain</th>
              <th className="p-2">Address</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((c: any) => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.name}</td>
                <td className="p-2 text-center">{c.symbol}</td>
                <td className="p-2 text-center">{c.chainKind}</td>
                <td className="p-2 text-center">{c.address ? `${c.address.slice(0,6)}…${c.address.slice(-4)}` : '-'}</td>
                <td className="p-2 text-center">
                  <Link href={`/admin/coins/${c.id}/edit`} className="underline mr-3">Edit</Link>
                  <form className="inline">
                    <button
                      className="underline text-red-500"
                      formAction={async () => {
                        'use server';
                        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/admin/coins/${c.id}`, { method: 'DELETE' });
                      }}
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
