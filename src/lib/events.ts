import fs from 'fs';
import path from 'path';
import type { EventItem } from '@/types/event';

const dataDir = path.join(process.cwd(), 'data');

export function loadEvents(): EventItem[] {
  const seedPath = path.join(dataDir, 'events.json');
  const generatedPath = path.join(dataDir, 'events.generated.json');
  let events: EventItem[] = [];
  if (fs.existsSync(seedPath)) {
    events = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  }
  if (fs.existsSync(generatedPath)) {
    const generated: EventItem[] = JSON.parse(fs.readFileSync(generatedPath, 'utf8'));
    const byId = new Map(events.map((e) => [e.id, e]));
    for (const g of generated) byId.set(g.id, g);
    events = Array.from(byId.values());
  }
  return events
    .filter((e) => e && e.id && e.lat && e.lng)
    .sort((a, b) => {
      const d = a.start.localeCompare(b.start);
      if (d !== 0) return d;
      return a.city.localeCompare(b.city);
    });
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
