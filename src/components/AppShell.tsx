'use client';

import { useMemo, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { EventItem, FilterMode } from '@/types/event';
import Filters from './Filters';
import EventCard from './EventCard';

const EventMap = dynamic(() => import('./EventMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-xl bg-stone-100 text-stone-500">
      Loading map…
    </div>
  ),
});

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

export default function AppShell({ events }: { events: EventItem[] }) {
  const [mode, setMode] = useState<FilterMode>('all');
  const [city, setCity] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const upcoming = useMemo(() => events.filter((e) => isStillOn(e)), [events]);
  const cities = useMemo(() => Array.from(new Set(upcoming.map((e) => e.city))).sort(), [upcoming]);

  const filtered = useMemo(() => {
    return upcoming.filter((e) => {
      if (mode !== 'all' && e.tag !== mode) return false;
      if (city && e.city !== city) return false;
      return true;
    });
  }, [upcoming, mode, city]);

  const onSelect = useCallback((id: string) => {
    setSelectedId(id);
    document.getElementById(`event-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  return (
    <div className="min-h-dvh bg-[#F7F5F0] text-[#1A2332]">
      <header className="border-b border-stone-200/80 bg-[#F7F5F0]/90 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Helsingborg <span className="text-stone-400">+</span> nearby
            </h1>
            <p className="text-sm text-stone-500">From 21 Sep 2026 · en-SE</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
        <div className="mb-4">
          <Filters mode={mode} onMode={setMode} cities={cities} city={city} onCity={setCity} />
        </div>
        <section className="mb-6 h-[50vh] min-h-[280px] overflow-hidden rounded-2xl border border-stone-200 shadow-sm">
          <EventMap events={filtered} selectedId={selectedId} onSelect={onSelect} />
        </section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Events</h2>
          <p className="text-sm text-stone-500">{filtered.length} shown</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <EventCard key={e.id} event={e} selected={selectedId === e.id} onSelect={onSelect} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="py-12 text-center text-stone-500">No events match these filters.</p>
        )}
        <footer className="mt-10 border-t border-stone-200 py-6 text-center text-xs text-stone-400">
          Family-friendly pins in teal · night out in coral · official links open in a new tab
        </footer>
      </main>
    </div>
  );
}
