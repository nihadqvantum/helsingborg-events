const CACHE = 'hbg-events-v1';
const SHELL = ['/', '/offline', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.pathname === '/api/events' || request.mode === 'navigate') {
    event.respondWith(fetch(request).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(request, copy)); return res; }).catch(() => caches.match(request).then((r) => r || caches.match('/offline'))));
    return;
  }
  if (url.pathname.startsWith('/images/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(request, copy)); return res; })));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});
self.addEventListener('push', (event) => {
  let data = { title: 'New near Helsingborg', body: 'Fresh events nearby', url: '/' };
  try { if (event.data) data = { ...data, ...event.data.json() }; } catch { /* ignore */ }
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: '/icons/icon-192.png', data: { url: data.url || '/' } }));
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url || '/';
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    for (const client of clients) { if ('focus' in client) { client.navigate(target); return client.focus(); } }
    return self.clients.openWindow(target);
  }));
});
