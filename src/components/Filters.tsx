'use client';

import type { FilterMode } from '@/types/event';

const MODES: { id: FilterMode; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'family', label: 'With a 3-year-old' },
  { id: 'night', label: 'Night out' },
];

export default function Filters({ mode, onMode, cities, city, onCity }: { mode: FilterMode; onMode: (m: FilterMode) => void; cities: string[]; city: string | null; onCity: (c: string | null) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button key={m.id} type="button" onClick={() => onMode(m.id)} className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${mode === m.id ? 'bg-[#1A2332] text-white' : 'bg-white text-[#1A2332] border border-stone-200 hover:border-stone-400'}`}>
            {m.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onCity(null)} className={`rounded-full px-3 py-1 text-xs font-medium transition ${!city ? 'bg-[#E07A5F] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>All cities</button>
        {cities.map((c) => (
          <button key={c} type="button" onClick={() => onCity(c === city ? null : c)} className={`rounded-full px-3 py-1 text-xs font-medium transition ${city === c ? 'bg-[#E07A5F] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
