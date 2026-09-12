import { NextRequest, NextResponse } from 'next/server';
import { loadEvents, loadSnapshotIds, writeGeneratedEvents, writeSnapshotIds } from '@/lib/events';
import { sendPushToAll } from '@/lib/push-server';
import type { EventItem } from '@/types/event';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET || 'devsecret';
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const now = new Date();
    const windowEnd = new Date(now);
    windowEnd.setDate(windowEnd.getDate() + 14);
    const crawled = await crawlOfficialCalendars();
    const seed = loadEvents();
    const byId = new Map(seed.map((e) => [e.id, e]));
    for (const c of crawled) if (!byId.has(c.id)) byId.set(c.id, c);
    const merged = Array.from(byId.values()).filter((e) => {
      const start = new Date(e.start);
      const end = e.end ? new Date(e.end) : start;
      return end >= now && start <= windowEnd;
    });
    writeGeneratedEvents(merged);
    const prevIds = new Set(loadSnapshotIds());
    const currentIds = merged.map((e) => e.id);
    const newEvents = merged.filter((e) => !prevIds.has(e.id) && prevIds.size > 0);
    writeSnapshotIds(currentIds);
    let push = { sent: 0, failed: 0, total: 0 };
    if (newEvents.length > 0) {
      const titles = newEvents.slice(0, 3).map((e) => e.title).join(', ');
      push = await sendPushToAll({
        title: 'New near Helsingborg',
        body: newEvents.length === 1 ? titles : `${newEvents.length} new events: ${titles}`,
        url: '/',
      });
    }
    return NextResponse.json({ ok: true, total: merged.length, crawled: crawled.length, newEvents: newEvents.map((e) => e.id), push, at: now.toISOString() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

async function crawlOfficialCalendars(): Promise<EventItem[]> {
  const sources = ['https://hbgcity.se/en/experience-city/events/', 'https://www.sofiero.se/blomstrande-host-pa-sofiero/'];
  for (const url of sources) {
    try {
      await fetch(url, { headers: { 'User-Agent': 'HBG-Events-PWA/1.0' }, signal: AbortSignal.timeout(8000) });
    } catch { /* ignore */ }
  }
  return [];
}
