import fs from 'fs';
import path from 'path';
import type { EventItem } from '@/types/event';

const dataDir = path.join(process.cwd(), 'data');
const REMOTE = 'https://raw.githubusercontent.com/nihadqvantum/helsingborg-events/main/data/events.json';

function isStillOn(e: EventItem, now = new Date()): boolean {
  if (e.end) {
    const end = new Date(e.end);
    if (!Number.isNaN(end.getTime())) return end >= now;
  }
  if (e.start) {
    const start = new Date(e.start);
    if (!Number.isNaN(start.getTime())) {
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return startDay >= today;
    }
  }
  return true;
}

function normalize(events: EventItem[]): EventItem[] {
  return events
    .filter((e) => e && e.id && e.lat && e.lng)
    .filter((e) => isStillOn(e))
    .filter((e) => typeof e.image === 'string' && e.image.startsWith('https://'))
    .sort((a, b) => {
      const d = a.start.localeCompare(b.start);
      if (d !== 0) return d;
      return a.city.localeCompare(b.city);
    });
}

function loadLocal(): EventItem[] {
  const seedPath = path.join(dataDir, 'events.json');
  if (!fs.existsSync(seedPath)) return [];
  return JSON.parse(fs.readFileSync(seedPath, 'utf8'));
}

export function loadEvents(): EventItem[] {
  return normalize(loadLocal());
}

export async function loadEventsAsync(): Promise<EventItem[]> {
  try {
    const res = await fetch(REMOTE, { next: { revalidate: 300 } });
    if (res.ok) {
      const data = await res.json();
      const normalized = normalize(data);
      if (normalized.length) return normalized;
    }
  } catch {
    // fall through
  }
  return loadEvents();
}

export function writeGeneratedEvents(events: EventItem[]) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'events.generated.json'), JSON.stringify(events, null, 2));
}

export function loadSnapshotIds(): string[] {
  const p = path.join(dataDir, 'snapshot-ids.json');
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export function writeSnapshotIds(ids: string[]) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'snapshot-ids.json'), JSON.stringify(ids, null, 2));
}
