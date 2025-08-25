import { prisma } from '@/lib/prisma';
import { ChainKind } from '@prisma/client';
import NewCoinForm from './_new-form';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminCoinsPage() {
  const coins = await prisma.coin.findMany({
    orderBy: [{ createdAt: 'desc' }],
    take: 200
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Coins</h1>
        <form action="/api/admin/logout" method="post">
          <button className="rounded border px-3 py-2 text-sm">Logout</button>
        </form>
      </div>

      <NewCoinForm />

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Symbol</th>
              <th className="text-left p-2">Chain</th>
              <th className="text-left p-2">Created</th>
              <th className="text-left p-2">Link</th>
            </tr>
          </thead>
          <tbody>
            {coins.map(c => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.symbol}</td>
                <td className="p-2">{c.chainKind}</td>
                <td className="p-2">{new Date(c.createdAt).toLocaleString()}</td>
                <td className="p-2">
                  <Link className="text-primary underline" href={`/coin/${c.slug}`}>view</Link>
                </td>
              </tr>
            ))}
            {coins.length === 0 && (
              <tr><td className="p-4 text-muted-foreground" colSpan={5}>No coins yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
