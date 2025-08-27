// app/admin/request/page.tsx
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminRequestsPage() {
  const rows = await prisma.coinRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">User Requests</h1>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th className="w-[28%]">Name</th>
              <th className="w-[15%]">Symbol</th>
              <th className="w-[18%]">Chain</th>
              <th className="w-[24%]">Address</th>
              <th className="w-[10%]">Status</th>
              <th className="w-[5%] text-right pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                  No requests.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2">{r.symbol}</td>
                  <td className="px-3 py-2">{r.chainKind}</td>
                  <td className="px-3 py-2">{r.address || '-'}</td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2">
                    {/* Sadece Reject - isteği tamamen siler */}
                    <form
                      action={`/admin/api/request/${r.id}/reject`}
                      method="post"
                      className="flex justify-end"
                    >
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
