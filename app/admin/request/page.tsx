import { prisma } from '@/lib/prisma';
import AdminRequestsActions from '../../api/admin/request/_actions';

export const dynamic = 'force-dynamic';

export default async function AdminRequests() {
  const requests = await prisma.coinRequest.findMany({
    orderBy: [{ createdAt: 'desc' }],
    take: 200
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">User Requests</h1>
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Symbol</th>
              <th className="text-left p-2">Chain</th>
              <th className="text-left p-2">Address</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.name}</td>
                <td className="p-2">{r.symbol}</td>
                <td className="p-2">{r.chainKind}</td>
                <td className="p-2">{r.address || '-'}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2"><AdminRequestsActions id={r.id} req={r} /></td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr><td className="p-4 text-muted-foreground" colSpan={6}>No requests.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
