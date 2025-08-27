import { prisma } from '@/lib/prisma';
import { rejectRequest } from './_actions';

export const dynamic = 'force-dynamic';

export default async function AdminRequestsPage() {
  const items = await prisma.coinRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">User Requests</h1>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="[&>th]:px-4 [&>th]:py-2 text-left">
              <th>Name</th>
              <th>Symbol</th>
              <th>Chain</th>
              <th>Address</th>
              <th>Status</th>
              <th className="w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                  No requests
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <tr key={r.id} className="border-t [&>td]:px-4 [&>td]:py-2">
                  <td className="font-medium">{r.name}</td>
                  <td>{r.symbol}</td>
                  <td>{r.chainKind}</td>
                  <td>{r.address || '-'}</td>
                  <td>{r.status}</td>
                  <td>
                    {/* Sadece REJECT: satırı siler */}
                    <form action={rejectRequest}>
                      <input type="hidden" name="id" value={r.id} />
                      <button
                        type="submit"
                        className="rounded bg-red-600 px-3 py-1 text-white hover:opacity-90"
                      >
                        Reject
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
