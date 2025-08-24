// app/api/reindex/route.ts
import { NextResponse } from 'next/server';
import { reindexTokens } from '../../../scripts/fetch_tokenlists';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const auth = request.headers.get('authorization') || '';
  if (!auth || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const n = await reindexTokens();
  return NextResponse.json({ ok: true, upserts: n });
}
