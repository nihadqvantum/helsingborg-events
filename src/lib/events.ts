import fs from 'fs';
import path from 'path';
import { inflateSync } from 'zlib';
import type { EventItem } from '@/types/event';

const dataDir = path.join(process.cwd(), 'data');
const REMOTE = 'https://raw.githubusercontent.com/nihadqvantum/helsingborg-events/main/data/events.json';
const REMOTE_ZLIB = 'https://raw.githubusercontent.com/nihadqvantum/helsingborg-events/main/data/events.json.zlib.b64';

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

function parseEventsJson(raw: string): EventItem[] | null {
  const t = raw.trim();
  if (!t || t === 'PLACEHOLDER_REPLACE' || t === 'PLACEHOLDER_WILL_REPLACE' || !t.startsWith('[')) return null;
  try {
    const data = JSON.parse(t);
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

function inflateB64(b64: string): EventItem[] | null {
  try {
    const data = JSON.parse(inflateSync(Buffer.from(b64.trim(), 'base64')).toString('utf8'));
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

function loadLocal(): EventItem[] {
  const seedPath = path.join(dataDir, 'events.json');
  const generatedPath = path.join(dataDir, 'events.generated.json');
  const zlibPath = path.join(dataDir, 'events.json.zlib.b64');

  let events: EventItem[] = [];
  if (fs.existsSync(seedPath)) {
    const parsed = parseEventsJson(fs.readFileSync(seedPath, 'utf8'));
    if (parsed) events = parsed;
  }
  if (!events.length && fs.existsSync(zlibPath)) {
    const inflated = inflateB64(fs.readFileSync(zlibPath, 'utf8'));
    if (inflated) events = inflated;
  }
  const generatedZlibPath = path.join(dataDir, 'events.generated.json.zlib.b64');
  let generated: EventItem[] | null = null;
  if (fs.existsSync(generatedPath)) {
    generated = parseEventsJson(fs.readFileSync(generatedPath, 'utf8'));
  }
  if ((!generated || !generated.length) && fs.existsSync(generatedZlibPath)) {
    generated = inflateB64(fs.readFileSync(generatedZlibPath, 'utf8'));
  }
  if (generated && generated.length) {
    const byId = new Map(events.map((e) => [e.id, e]));
    for (const g of generated) byId.set(g.id, g);
    events = Array.from(byId.values());
  }
  return events;
}

export function loadEvents(): EventItem[] {
  return normalize(loadLocal());
}

export async function loadEventsAsync(): Promise<EventItem[]> {
  try {
    const res = await fetch(REMOTE, { next: { revalidate: 300 } });
    if (res.ok) {
      const text = await res.text();
      const parsed = parseEventsJson(text);
      if (parsed) {
        const normalized = normalize(parsed);
        if (normalized.length) return normalized;
      }
    }
  } catch {
    // fall through
  }
  try {
    const res = await fetch(REMOTE_ZLIB, { next: { revalidate: 300 } });
    if (res.ok) {
      const inflated = inflateB64(await res.text());
      if (inflated) {
        const normalized = normalize(inflated);
        if (normalized.length) return normalized;
      }
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
