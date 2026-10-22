const CACHE = 'oikos-v2';
const CORE = ['/', '/index.html', '/manifest.webmanifest'];
const DEV_HOST = ['localhost', '127.0.0.1', '[::1]'].includes(self.location.hostname);
self.addEventListener('install', event => event.waitUntil((async () => {
  if (!DEV_HOST) {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE.map(url => new Request(url, {cache: 'reload'})));
  }
  await self.skipWaiting();
})()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(key => key.startsWith('oikos-') && (DEV_HOST || key !== CACHE)).map(key => caches.delete(key)));
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (DEV_HOST || event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    // Check for current HTML; only use the saved shell when offline.
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const response = await fetch(event.request, {cache: 'no-store'});
        if (response.ok) await cache.put('/index.html', response.clone()).catch(() => {});
        return response;
      } catch (error) {
        const cached = await cache.match('/index.html');
        if (cached) return cached;
        throw error;
      }
    })());
    return;
  }
  // Vite assets have content hashes; an updated build uses different URLs.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone()).catch(() => {});
      return response;
    })());
  }
});
