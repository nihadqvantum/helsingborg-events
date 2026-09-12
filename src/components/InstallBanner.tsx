'use client';
import { useEffect, useState } from 'react';
interface BIP extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
function isIos() { return typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent); }
function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as { standalone?: boolean }).standalone === true;
}
export default function InstallBanner() {
  const [deferred, setDeferred] = useState<BIP | null>(null);
  const [showIos, setShowIos] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    if (isStandalone()) return;
    const t = localStorage.getItem('hbg-install-dismissed');
    if (t && Date.now() - Number(t) < 7 * 24 * 3600 * 1000) { setDismissed(true); return; }
    const onBip = (e: Event) => { e.preventDefault(); setDeferred(e as BIP); };
    window.addEventListener('beforeinstallprompt', onBip);
    if (isIos()) setShowIos(true);
    return () => window.removeEventListener('beforeinstallprompt', onBip);
  }, []);
  function dismiss() { setDismissed(true); setDeferred(null); setShowIos(false); localStorage.setItem('hbg-install-dismissed', String(Date.now())); }
  if (dismissed || (!deferred && !showIos)) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3">
      <div className="mx-auto flex max-w-lg items-start gap-3 rounded-2xl border border-stone-200 bg-white/95 p-4 shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" className="h-10 w-10 rounded-xl" />
        <div className="flex-1 text-sm">
          {deferred ? (
            <><p className="font-semibold">Add to home screen</p><p className="text-stone-600">Install for quick access offline.</p>
            <button type="button" onClick={async () => { await deferred.prompt(); await deferred.userChoice; setDeferred(null); }} className="mt-2 rounded-full bg-[#1A2332] px-3 py-1.5 text-xs text-white">Install</button></>
          ) : (
            <><p className="font-semibold">Add to Home Screen</p><p className="text-stone-600">On iPhone: tap Share, then Add to Home Screen.</p></>
          )}
        </div>
        <button type="button" onClick={dismiss} aria-label="Dismiss" className="text-stone-400">✕</button>
      </div>
    </div>
  );
}
