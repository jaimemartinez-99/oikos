const CACHE = 'oikos-v1';
const CORE = ['/', '/index.html', '/manifest.webmanifest'];
const DEV_HOST = ['localhost', '127.0.0.1', '[::1]'].includes(self.location.hostname);
self.addEventListener('install', event => event.waitUntil(DEV_HOST ? self.skipWaiting() : caches.open(CACHE).then(cache => cache.addAll(CORE))));
self.addEventListener('activate', event => event.waitUntil(DEV_HOST ? caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('oikos-')).map(key => caches.delete(key)))).then(() => self.clients.claim()) : self.clients.claim()));
self.addEventListener('fetch', event => {
  if (DEV_HOST) return;
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => { const copy=response.clone(); caches.open(CACHE).then(cache=>cache.put(event.request,copy)); return response })))
});
