// app/api/reindex/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { reindexTokens } from '../../../scripts/fetch_tokenlists';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await reindexTokens();
  return NextResponse.json({ ok: true });
}
