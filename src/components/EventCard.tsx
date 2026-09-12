'use client';

import type { EventItem } from '@/types/event';
import { formatEventWhen } from '@/lib/format';

export default function EventCard({ event, selected, onSelect }: { event: EventItem; selected: boolean; onSelect: (id: string) => void }) {
  return (
    <a href={event.url} target="_blank" rel="noopener noreferrer" id={`event-${event.id}`} onClick={() => onSelect(event.id)} onFocus={() => onSelect(event.id)}
      className={`group block overflow-hidden rounded-2xl border bg-white transition shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2A9D8F] ${selected ? 'border-[#2A9D8F] ring-2 ring-[#2A9D8F]/40' : 'border-stone-200'}`}>
      <div className="aspect-[16/10] overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.image} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.02]" loading="lazy" />
      </div>
      <div className="p-3 sm:p-4">
        <div className="mb-1 flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${event.tag === 'family' ? 'bg-[#2A9D8F]' : 'bg-[#E07A5F]'}`} />
          <span className="text-xs font-medium uppercase tracking-wide text-stone-500">{event.tag === 'family' ? 'With a 3-year-old' : 'Night out'}</span>
        </div>
        <h3 className="text-base font-semibold text-[#1A2332] leading-snug">{event.title}</h3>
        <p className="mt-1 text-sm text-stone-600">{formatEventWhen(event.start, event.end)}</p>
        <p className="mt-0.5 text-sm text-stone-500">{event.venue} · {event.city}</p>
        <p className="mt-2 text-sm font-medium text-[#1A2332]">{event.price}</p>
      </div>
    </a>
  );
}
