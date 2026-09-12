'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { EventItem } from '@/types/event';
import 'leaflet/dist/leaflet.css';

const tealIcon = L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#2A9D8F;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});
const coralIcon = L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#E07A5F;border:2px solid #1A2332;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

function FlyTo({ event }: { event: EventItem | null }) {
  const map = useMap();
  useEffect(() => {
    if (event) map.flyTo([event.lat, event.lng], 14, { duration: 0.8 });
  }, [event, map]);
  return null;
}

export default function EventMap({
  events, selectedId, onSelect,
}: {
  events: EventItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const center = useMemo<[number, number]>(() => [56.0465, 12.6945], []);
  const selected = events.find((e) => e.id === selectedId) || null;
  return (
    <MapContainer center={center} zoom={11} className="h-full w-full rounded-xl z-0" scrollWheelZoom={false}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FlyTo event={selected} />
      {events.map((e) => (
        <Marker key={e.id} position={[e.lat, e.lng]} icon={e.tag === 'family' ? tealIcon : coralIcon} eventHandlers={{ click: () => onSelect(e.id) }}>
          <Popup>
            <strong>{e.title}</strong><br />{e.venue}, {e.city}<br />
            <span className="text-xs">{e.tag === 'family' ? 'Family-friendly' : 'Night out'}</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
