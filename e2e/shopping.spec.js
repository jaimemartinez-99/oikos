import {test, expect} from '@playwright/test';

const fixture = {
  tickets: [{id: 'ticket-1', date: '2026-10-20', items: [
    {id: 'banana', name: 'Plátanos', quantity: '2 kg', checked: false},
    {id: 'milk', name: 'Yogur de fresa', quantity: '4', checked: true},
    {id: 'fairy', name: 'Fairy limón', quantity: '1', checked: false},
    {id: 'hummus', name: 'Hummus', quantity: '1', checked: false},
    {id: 'unknown', name: 'Producto intergaláctico XYZ', quantity: '3', checked: false},
  ]}],
  members: [], rooms: [], roomRows: [], furniture: [], tasks: [], assignments: [], notes: [], expenses: [], types: [], meals: [],
};
const row = (page, id) => page.locator(`[data-shopping-item="${id}"]`);
const group = (page, name) => page.getByRole('region', {name, exact: true});

test.beforeEach(async ({page}) => {
  // Isolated demo browser: never contacts or modifies the real household.
  await page.addInitScript(data => {if (!localStorage.oikosData) localStorage.oikosData = JSON.stringify(data);}, fixture);
  await page.goto('/app/compra');
  await expect(page.getByRole('heading', {name: 'Lista de la compra'})).toBeVisible();
});

test('groups old tickets, keeps unknown distinct from others and fits the viewport', async ({page}) => {
  await expect(group(page, 'Fruta')).toContainText('Plátanos');
  await expect(group(page, 'Lácteos y huevos')).toContainText('Yogur de fresa');
  await expect(group(page, 'Limpieza y hogar')).toContainText('Fairy limón');
  await expect(group(page, 'Otros')).toContainText('Hummus');
  await expect(group(page, 'Desconocido')).toContainText('Producto intergaláctico XYZ');
  await expect(page.locator('[data-shopping-item]')).toHaveCount(5);
  await expect(row(page, 'milk').getByRole('button', {name: 'Marcar Yogur de fresa como pendiente'})).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({path: `e2e/.results/shopping-${test.info().project.name}.png`, fullPage: true});
});

test('right-click categorises, remembers after reload and applies to future products', async ({page}) => {
  await row(page, 'unknown').click({button: 'right'});
  const menu = page.getByRole('menu', {name: 'Categorizar Producto intergaláctico XYZ'});
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitemradio', {name: 'Desconocido', exact: true})).toHaveAttribute('aria-checked', 'true');
  await menu.getByRole('menuitemradio', {name: 'Limpieza y hogar'}).click();
  await expect(group(page, 'Limpieza y hogar')).toContainText('Producto intergaláctico XYZ');
  await expect(group(page, 'Desconocido')).toHaveCount(0);
  await page.reload();
  await expect(group(page, 'Limpieza y hogar')).toContainText('Producto intergaláctico XYZ');
  await page.getByRole('combobox', {name: 'Añadir producto', exact: true}).fill('PRODUCTO INTERGALÁCTICO XYZ');
  await page.getByRole('button', {name: 'Añadir producto al ticket'}).click();
  await expect(group(page, 'Limpieza y hogar').locator('[data-shopping-item]')).toHaveCount(3);
  await expect(row(page, 'unknown')).toContainText('3');
});

test('category button supports keyboard, dismissal, explicit unknown and automatic reset', async ({page}) => {
  const trigger = row(page, 'banana').getByRole('button', {name: 'Categorizar Plátanos'});
  await trigger.click();
  const menu = page.getByRole('menu');
  await expect(menu.getByRole('menuitemradio', {name: 'Fruta', exact: true})).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitemradio', {name: 'Verdura y hortalizas'})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await menu.getByRole('menuitemradio', {name: 'Desconocido', exact: true}).click();
  await expect(group(page, 'Desconocido')).toContainText('Plátanos');
  await row(page, 'banana').getByRole('button', {name: 'Categorizar Plátanos'}).click();
  await menu.getByRole('menuitem', {name: 'Volver a detección automática'}).click();
  await expect(group(page, 'Fruta')).toContainText('Plátanos');
  await row(page, 'banana').getByRole('button', {name: 'Categorizar Plátanos'}).click();
  await page.getByRole('heading', {name: 'Lista de la compra'}).click();
  await expect(menu).toHaveCount(0);
});

test('editing changes category, preserves quantity and purchased state, and allows cancelling', async ({page}) => {
  await row(page, 'milk').getByRole('button', {name: 'Editar Yogur de fresa'}).click();
  await row(page, 'milk').getByLabel('Producto', {exact: true}).fill('Salmón');
  await row(page, 'milk').getByLabel('Cantidad', {exact: true}).fill('500 g');
  await row(page, 'milk').getByRole('button', {name: 'Guardar'}).click();
  await expect(group(page, 'Pescado y marisco')).toContainText('Salmón');
  await expect(row(page, 'milk')).toContainText('500 g');
  await expect(row(page, 'milk').getByRole('button', {name: 'Marcar Salmón como pendiente'})).toHaveAttribute('aria-pressed', 'true');
  await row(page, 'milk').getByRole('button', {name: 'Editar Salmón'}).click();
  await row(page, 'milk').getByLabel('Producto', {exact: true}).fill('Manzana');
  await row(page, 'milk').getByRole('button', {name: 'Cancelar'}).click();
  await expect(group(page, 'Pescado y marisco')).toContainText('Salmón');
});

test('menu stays on screen near the viewport edge and touch hold opens it', async ({page, isMobile}) => {
  const target = row(page, 'banana');
  if (isMobile) {
    const text = target.locator('span').first();
    const bounds = await text.boundingBox();
    await text.dispatchEvent('pointerdown', {pointerType: 'touch', clientX: bounds.x + 5, clientY: bounds.y + 5});
    await expect(page.getByRole('menu')).toBeVisible();
    await text.dispatchEvent('pointerup', {pointerType: 'touch'});
    await page.keyboard.press('Escape');
  }
  const size = page.viewportSize();
  await target.dispatchEvent('contextmenu', {clientX: size.width - 2, clientY: size.height - 2});
  await expect(page.getByRole('menu')).toBeVisible();
  await expect.poll(async () => {
    const bounds = await page.getByRole('menu').boundingBox();
    return bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= size.width && bounds.y + bounds.height <= size.height;
  }).toBe(true);
  await page.getByRole('menuitemradio', {name: 'Bebidas', exact: true}).click();
  await expect(group(page, 'Bebidas')).toContainText('Plátanos');
});
