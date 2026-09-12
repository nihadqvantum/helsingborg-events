import { NextRequest, NextResponse } from 'next/server';
import { removeSubscription } from '@/lib/subscriptions';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.endpoint) {
      return NextResponse.json({ error: 'endpoint required' }, { status: 400 });
    }
    removeSubscription(body.endpoint);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
