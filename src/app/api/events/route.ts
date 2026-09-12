import { NextResponse } from 'next/server';
import { loadEvents } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET() {
  const events = loadEvents();
  return NextResponse.json({ events, updatedAt: new Date().toISOString() });
}
