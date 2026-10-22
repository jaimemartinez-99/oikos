import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const script = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
function worker(hostname = 'oikos.example') {
  const origin = `https://${hostname}`;
  const listeners = {};
  const stores = new Map();
  let skipped = false, claimed = false;
  const key = request => new URL(typeof request === 'string' ? request : request.url, origin).href;
  const caches = {
    keys: async () => [...stores.keys()],
    delete: async name => stores.delete(name),
    open: async name => {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        match: async request => store.get(key(request))?.clone(),
        put: async (request, response) => store.set(key(request), response.clone()),
        addAll: async requests => {
          for (const request of requests) {
            assert.equal(request.cache, 'reload');
            store.set(key(request), new Response('installed shell'));
          }
        },
      };
    },
  };
  const context = vm.createContext({
    URL, caches,
    Request: class extends Request {constructor(url, init) {super(new URL(url, origin), init);}},
    fetch: (...args) => context.network(...args),
    self: {
      location: {hostname, origin},
      addEventListener: (type, callback) => {listeners[type] = callback;},
      skipWaiting: async () => {skipped = true;},
      clients: {claim: async () => {claimed = true;}},
    },
  });
  vm.runInContext(script, context);
  return {
    caches, context,
    lifecycle: async type => {let done; listeners[type]({waitUntil: promise => {done = promise;}}); await done;},
    status: () => ({skipped, claimed}),
    request: (path, {mode = 'navigate', method = 'GET'} = {}) => {
      let response;
      listeners.fetch({request: {url: new URL(path, origin).href, mode, method}, respondWith: promise => {response = promise;}});
      return response;
    },
  };
}

test('new service worker activates immediately and removes obsolete Oikos caches', async () => {
  const app = worker();
  await app.caches.open('oikos-v1');
  await app.caches.open('other-app');
  await app.lifecycle('install');
  await app.lifecycle('activate');
  assert.deepEqual(await app.caches.keys(), ['other-app', 'oikos-v2']);
  assert.deepEqual(app.status(), {skipped: true, claimed: true});
});

test('navigation fetches fresh HTML even when cached, then uses it offline on another route', async () => {
  const app = worker();
  await app.lifecycle('install');
  app.context.network = async (request, options) => {
    assert.equal(options.cache, 'no-store');
    return new Response('new deployment');
  };
  assert.equal(await (await app.request('/app/compra')).text(), 'new deployment');
  app.context.network = async () => {throw new Error('offline');};
  assert.equal(await (await app.request('/app/notas')).text(), 'new deployment');
});

test('HTTP errors do not replace the offline shell and missing shells fail honestly', async () => {
  const app = worker();
  await app.lifecycle('install');
  app.context.network = async () => new Response('server error', {status: 503});
  assert.equal((await app.request('/app/compra')).status, 503);
  app.context.network = async () => {throw new Error('offline');};
  assert.equal(await (await app.request('/app/compra')).text(), 'installed shell');
  await app.caches.delete('oikos-v2');
  await assert.rejects(app.request('/app/compra'), /offline/);
});

test('full cache storage never hides fresh HTML or prevents loading a new asset', async () => {
  const app = worker();
  await app.lifecycle('install');
  const open = app.caches.open;
  app.caches.open = async name => ({
    ...await open(name),
    put: async () => {throw new Error('QuotaExceededError');},
  });
  app.context.network = async () => new Response('fresh content');
  assert.equal(await (await app.request('/app/compra')).text(), 'fresh content');
  assert.equal(await (await app.request('/assets/new.js', {mode: 'cors'})).text(), 'fresh content');
});

test('only hashed build assets use cache-first; API calls and refresh probes use the network', async () => {
  const app = worker();
  let calls = 0;
  app.context.network = async () => {calls++; return new Response('asset');};
  const options = {mode: 'cors'};
  assert.equal(await (await app.request('/assets/index-abc.js', options)).text(), 'asset');
  assert.equal(await (await app.request('/assets/index-abc.js', options)).text(), 'asset');
  assert.equal(calls, 1);
  assert.equal(app.request('/api/data', options), undefined);
  assert.equal(app.request('/app/compra?_oikos_refresh=123', options), undefined);
  assert.equal(app.request('https://other.example/assets/file.js', options), undefined);
  assert.equal(app.request('/app/compra', {method: 'POST'}), undefined);
});
