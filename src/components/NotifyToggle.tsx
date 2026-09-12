'use client';
import { useEffect, useState } from 'react';
import { getNotifyEnabled, setNotifyEnabled, getLastSeenIds, setLastSeenIds } from '@/lib/idb';
import { subscribeToPush, unsubscribeFromPush, ensureServiceWorker } from '@/lib/push-client';
import type { EventItem } from '@/types/event';

export default function NotifyToggle({ events }: { events: EventItem[] }) {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  useEffect(() => { getNotifyEnabled().then(setEnabled); ensureServiceWorker().catch(() => {}); }, []);
  useEffect(() => {
    if (!events.length) return;
    (async () => {
      const on = await getNotifyEnabled();
      if (!on) { await setLastSeenIds(events.map((e) => e.id)); return; }
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      const prev = await getLastSeenIds();
      if (prev.length === 0) { await setLastSeenIds(events.map((e) => e.id)); return; }
      const fresh = events.filter((e) => !new Set(prev).has(e.id));
      if (fresh.length > 0) {
        const title = 'New near Helsingborg';
        const body = fresh.length === 1 ? fresh[0].title : `${fresh.length} new events: ${fresh.slice(0, 3).map((e) => e.title).join(', ')}`;
        try {
          const reg = await navigator.serviceWorker?.ready;
          if (reg?.showNotification) await reg.showNotification(title, { body, icon: '/icons/icon-192.png', data: { url: '/' } });
          else new Notification(title, { body, icon: '/icons/icon-192.png' });
        } catch { /* ignore */ }
      }
      await setLastSeenIds(events.map((e) => e.id));
    })();
  }, [events]);
  async function toggle() {
    setBusy(true); setHint(null);
    try {
      if (!enabled) {
        if (!('Notification' in window)) { setHint('Notifications not supported.'); return; }
        try { await subscribeToPush(); }
        catch {
          const perm = await Notification.requestPermission();
          if (perm !== 'granted') { setHint('Permission denied.'); return; }
          setHint('Local alerts on.');
        }
        await setNotifyEnabled(true);
        await setLastSeenIds(events.map((e) => e.id));
        setEnabled(true);
      } else {
        try { await unsubscribeFromPush(); } catch { /* ignore */ }
        await setNotifyEnabled(false);
        setEnabled(false);
      }
    } finally { setBusy(false); }
  }
  return (
    <div className="flex flex-col items-end gap-1">
      <button type="button" disabled={busy} onClick={toggle} aria-pressed={enabled} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${enabled ? 'border-[#2A9D8F] bg-[#2A9D8F]/15' : 'border-stone-300 bg-white text-stone-600'}`}>
        <span className={`h-2.5 w-2.5 rounded-full ${enabled ? 'bg-[#2A9D8F]' : 'bg-stone-300'}`} />
        Notify me about new events
      </button>
      {hint && <p className="max-w-[16rem] text-right text-xs text-stone-500">{hint}</p>}
    </div>
  );
}
