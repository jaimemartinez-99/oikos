// JavaScript cannot clear Safari's entire HTTP cache or HttpOnly cookies.
function clearCookies() {
  const paths = new Set(['/']);
  let path = '';
  for (const segment of window.location.pathname.split('/').filter(Boolean)) {
    path += `/${segment}`;
    paths.add(path);
    paths.add(`${path}/`);
  }
  const domains = ['', window.location.hostname];
  const parts = window.location.hostname.split('.');
  while (parts.length > 2) {
    parts.shift();
    domains.push(parts.join('.'));
  }
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    if (!name) continue;
    for (const path of paths) {
      for (const domain of domains) {
        document.cookie = `${name}=; Max-Age=0; path=${path}${domain ? `; domain=${domain}` : ''}`;
      }
    }
  }
}

export async function refreshApp({beforeClear = async () => {}} = {}) {
  // A unique URL also bypasses HTML cached by the previous service worker.
  const url = new URL(window.location.href);
  url.searchParams.set('_oikos_refresh', Date.now().toString());
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url.href, {cache: 'no-store', signal: controller.signal});
    if (!response.ok) throw new Error('No se pudo descargar la página. Inténtalo de nuevo con conexión.');
    await response.text();
  } finally {
    clearTimeout(timeout);
  }
  await beforeClear();

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(registration => registration.unregister()));
  }
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
  }
  localStorage.clear();
  sessionStorage.clear();
  clearCookies();
  window.location.replace(url.href);
}
