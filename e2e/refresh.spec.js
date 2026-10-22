import {test, expect} from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.goto('/app/compra?view=all#lista');
  await expect(page.getByRole('heading', {name: 'Lista de la compra'})).toBeVisible();
  await page.evaluate(() => {
    localStorage.setItem('refresh-test', 'local');
    sessionStorage.setItem('refresh-test', 'session');
    document.cookie = 'refresh-root=old; path=/';
    document.cookie = 'refresh-app=old; path=/app';
    document.cookie = 'refresh-page=old; path=/app/compra';
  });
});

test('refresh sits next to logout, fits mobile and cancellation keeps local data', async ({page}) => {
  const refresh = page.getByRole('button', {name: 'Limpiar datos y recargar'});
  const logout = page.getByRole('button', {name: 'Cerrar sesión'});
  const a = await refresh.boundingBox();
  const b = await logout.boundingBox();
  expect(a.width).toBeGreaterThanOrEqual(44);
  expect(a.height).toBeGreaterThanOrEqual(44);
  expect(a.x + a.width).toBeLessThanOrEqual(b.x);
  expect(b.x + b.width).toBeLessThanOrEqual(page.viewportSize().width);
  page.once('dialog', async dialog => {
    expect(dialog.message()).toContain('tendrás que iniciar sesión de nuevo');
    await dialog.dismiss();
  });
  await refresh.click();
  expect(await page.evaluate(() => localStorage.getItem('refresh-test'))).toBe('local');
  expect(await page.evaluate(() => sessionStorage.getItem('refresh-test'))).toBe('session');
  expect(await page.evaluate(() => document.cookie)).toContain('refresh-page=old');
});

test('clears storage, cookies, caches and service workers, then reloads the same route', async ({page}) => {
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    const cache = await caches.open('refresh-test');
    await cache.put('/old-content', new Response('obsolete'));
  });
  const navigation = page.waitForRequest(request => request.isNavigationRequest() && request.url().includes('_oikos_refresh='));
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', {name: 'Limpiar datos y recargar'}).click();
  await navigation;
  await expect(page.getByRole('heading', {name: 'Lista de la compra'})).toBeVisible();
  await expect(page).toHaveURL(/\/app\/compra\?view=all#lista$/);
  const state = await page.evaluate(async () => ({
    local: localStorage.getItem('refresh-test'),
    session: sessionStorage.getItem('refresh-test'),
    cookies: document.cookie,
    caches: await caches.keys(),
    workers: (await navigator.serviceWorker.getRegistrations()).length,
  }));
  expect(state).toEqual({local: null, session: null, cookies: '', caches: [], workers: 0});
});

test('network failure leaves local data intact and allows retry', async ({page}) => {
  await page.route(url => url.searchParams.has('_oikos_refresh'), route => route.abort('internetdisconnected'));
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', {name: 'Limpiar datos y recargar'}).click();
  await expect(page.getByRole('alert')).toContainText('Comprueba la conexión');
  await expect(page.getByRole('button', {name: 'Limpiar datos y recargar'})).toBeEnabled();
  expect(await page.evaluate(() => localStorage.getItem('refresh-test'))).toBe('local');
  expect(await page.evaluate(() => document.cookie)).toContain('refresh-root=old');
});
