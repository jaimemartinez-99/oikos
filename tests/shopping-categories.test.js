import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyProduct, groupShoppingItems, normalizeProductName, productCategoryKey, setProductCategory, shoppingCategories, syncShoppingCategories} from '../src/shoppingCategories.js';
import {shoppingCatalogue} from '../src/shoppingCatalogue.js';
import {collectPendingItems} from '../src/shopping.js';

// Real shopping phrases, including brands, ingredients, packaging and modifiers.
const examples = {
  fruit: ['Plátano', 'PLATANOS de Canarias', '6 manzanas golden', 'Kiwis amarillos', 'Naranjas de zumo', 'Frambuesas congeladas', 'Aguacates maduros', 'Uvas sin pepitas', 'Arándanos', 'Cerezas del Jerte', 'Limones', 'Fresones', 'Peras conferencia', 'Caquis', 'Dátiles sin hueso'],
  vegetables: ['Tomates cherry', '2 calabacines', 'Zanahorias', 'Cebollas moradas', 'Bolsa de espinacas', 'Judías verdes congeladas', 'Guisantes congelados', 'Champiñones laminados', 'Pimientos de Padrón', 'Patatas para cocer', 'Ajos', 'Brócoli', 'Berenjenas', 'Canónigos', 'Espárragos trigueros', 'Maíz dulce', 'Setas shiitake'],
  meat: ['Pechugas de pollo', 'Carne picada de ternera', 'Jamón cocido Campofrío', 'Pavo en lonchas', 'Chorizos', 'Contramuslos deshuesados', 'Costillas adobadas', 'Bacon ahumado', 'Chuletón', 'Lomos de cerdo', 'Solomillos', 'ElPozo', 'Navidul', 'Fuet Noel', 'Salchichas frescas'],
  fish: ['Lomos de salmón', 'Filetes de merluza congelados', 'Atún en lata', 'Bonito del norte en aceite', 'Sardinillas en escabeche', 'Mejillones', 'Gambas peladas', 'Boquerones en vinagre', 'Palitos de cangrejo', 'Anillas de calamar', 'Bacalao desalado', 'Navajas', 'Berberechos', 'Surimi', 'Pescanova', 'Rianxeira'],
  dairy: ['Leche sin lactosa', 'Yogures de fresa', 'Yogur de avena', 'Danone', 'Activia', 'Philadelphia', 'Queso fresco Burgo de Arias', 'Huevos camperos', 'Claras de huevo', 'Mantequilla sin sal', 'Nata para cocinar', 'Quesitos', 'Mozzarella', 'Queso de cabra', 'Leche condensada', 'Arroz con leche', 'Flanes de vainilla', 'Kéfir natural', 'Cacaolat', 'Batido de chocolate'],
  grains: ['Arroz integral', 'Macarrones Gallo', 'Espaguetis integrales', 'Pasta de lentejas', 'Fideos de arroz', 'Pan de molde Bimbo', 'Pan rallado', 'Tortillas de trigo', 'Harina de garbanzo', 'Copos de avena', 'Cereales de chocolate', 'Quinoa', 'Cuscús', 'Maizena', 'Brillante', 'Kelloggs', 'Nesquik cereales', 'Gallo macarrones', 'Bagels'],
  legumes: ['Garbanzos cocidos', 'Lentejas pardinas', 'Alubias blancas', 'Judías pintas', 'Frijoles negros', 'Judiones', 'Soja texturizada', 'Tofu firme', 'Tempeh', 'Luengo', 'Altramuces'],
  drinks: ['Agua con gas', 'Zumo de naranja', 'Café molido', 'Té verde', 'Cápsulas de café', 'Leche de avena', 'Bebida de almendras', 'Leche de coco', 'Coca-Cola Zero', 'Aquarius limón', 'CocaCola', 'Nescafé descafeinado', 'Cola Cao', 'Nesquik', 'Alpro avena', 'Oatly', 'Cervezas', 'Vino blanco', 'Horchata', 'Don Simón naranja', 'Font Vella', 'Red Bull', 'Mahou', 'Whisky', 'Infusiones'],
  household: ['Fairy', 'FAIRY limón', 'Mistol', 'KH-7', 'KH7', 'Sanytol', 'Ariel pods', 'Skip', 'Lenor', 'Bosque Verde', 'Don Limpio', 'Finish', 'Papel de cocina', 'Bolsas de basura', 'Papel de aluminio', 'Detergente líquido', 'Sal para lavavajillas', 'Vinagre de limpieza', 'Agua destilada', 'Jabón de platos', 'Ambientador de coco', 'Pilas Duracell', 'Estropajos', 'Bayetas', 'Bolsa de congelación', 'Whiskas', 'Pienso para perro', 'Kleenex', 'Fregasuelos de limón'],
  hygiene: ['Champú de manzana', 'Champu Pantene', 'H&S', 'H & S', 'H-S', 'Desodorante Axe', 'Gel de ducha de coco', 'Leche corporal', 'Agua micelar', 'Pasta de dientes', 'Pasta dental Colgate', 'Papel higiénico', 'Papel WC', 'Pañales Dodot', 'Toallitas de bebé', 'Tampax', 'Nivea', 'Sanex', 'Listerine', 'Cuchillas Gillette', 'Aceite corporal', 'Lima de uñas', 'Jabón de manos', 'Protector solar', 'Durex', 'Hilo dental'],
  other: ['Hummus', 'Aceite', 'Aceite de oliva virgen extra', 'Aceite de coco', 'Tomate frito', 'Tomate triturado', 'Crema de cacahuete', 'Galletas de avena', 'Chocolate con leche', 'Helado de fresa', 'Mermelada de naranja', 'Salsa de soja', 'Salsa de queso', 'Patatas fritas', 'Croquetas de pollo', 'Pizza de atún', 'Sopa de pescado', 'Caldo de pollo', 'Huevos de chocolate', 'Pimentón de la Vera', 'Pimienta negra', 'Azúcar moreno', 'Sal fina', 'Lays', 'Doritos', 'Nutella', 'Oreo', 'Kinder', 'Nueces', 'Cacahuetes', 'Almendras', 'Heura', 'Tortilla de patatas', 'Salsa de yogur'],
};

for (const [category, names] of Object.entries(examples)) {
  test(`classifies real shopping names as ${category}`, () => {
    const wrong = names.map(name => ({name, actual: classifyProduct(name)})).filter(item => item.actual !== category);
    assert.deepEqual(wrong, [], `Expected ${category}`);
  });
}

test('catalogue covers over 2000 distinct names without silently conflicting categories', () => {
  const names = new Map();
  for (const [category, sources] of Object.entries(shoppingCatalogue)) {
    for (const aliases of Object.values(sources)) for (const alias of aliases.split('|')) {
      const key = productCategoryKey(alias);
      if (!key) continue;
      if (!names.has(key)) names.set(key, new Set());
      names.get(key).add(category);
    }
  }
  assert.ok(names.size > 2000, `Only ${names.size} names`);
  for (const [name, categories] of names) {
    if (categories.size > 1) assert.equal(classifyProduct(name), 'unknown', `Ambiguous: ${name}`);
    else assert.equal(classifyProduct(name), [...categories][0], name);
  }
});

test('normalises accents, plurals, punctuation and whitespace without matching substrings', () => {
  assert.equal(normalizeProductName('  PLÁTANO  — Canarias! '), 'platano canarias');
  for (const pair of [['plátanos', 'platano'], ['CALABACINES', 'calabacín'], ['nueces', 'nuez'], ['YOGURES DE FRESA', 'yogur de fresa']]) assert.equal(productCategoryKey(pair[0]), productCategoryKey(pair[1]));
  for (const name of ['campana', 'salida', 'pantalón', 'pantera', 'arrozal', 'lechero', 'lavavajillero', 'platanópolis']) assert.equal(classifyProduct(name), 'unknown', name);
});

test('small unambiguous typos are recognised; unknown and ambiguous names stay unknown', () => {
  for (const [name, category] of [['platnao', 'fruit'], ['platanp', 'fruit'], ['fairi', 'household'], ['detergnete', 'household'], ['macarones', 'grains']]) assert.equal(classifyProduct(name), category, name);
  for (const name of ['', null, '   ', 'Producto intergaláctico xyz', 'Nestlé', 'Hacendado', 'Carrefour', 'Gallo', 'Polo', 'bote grande marca xyz']) assert.equal(classifyProduct(name), 'unknown', String(name));
});

test('specific product heads beat generic cuts and ambiguous ingredients', () => {
  for (const [name, category] of [
    ['Filetes de gallo', 'fish'], ['Lomos de salmón', 'fish'], ['Hamburguesa de pescado', 'fish'],
    ['Hamburguesa de pollo', 'meat'], ['Filetes de ternera', 'meat'], ['Solomillo', 'meat'],
    ['Ensalada de pasta', 'grains'], ['Ensalada de arroz', 'grains'], ['Ensalada de tomate', 'vegetables'],
    ['Gel lavavajillas', 'household'], ['Gel de ducha de avena', 'hygiene'], ['Papel para horno', 'household'],
    ['SOS', 'grains'], ['Isabel', 'fish'], ['Hacendado leche', 'dairy'], ['Hacendado', 'unknown'],
  ]) assert.equal(classifyProduct(name), category, name);
});

test('manual choices override automatic categories, cover spelling variants and can be reset', () => {
  const data = {tickets: [], otherData: 'untouched'};
  const chosen = setProductCategory(data, 'Plátanos', 'other');
  assert.equal(classifyProduct('PLATANO', chosen.shoppingCategoryOverrides), 'other');
  assert.equal(chosen.tickets, data.tickets);
  assert.equal(data.shoppingCategoryOverrides, undefined);
  assert.equal(setProductCategory(chosen, 'platano', 'other'), chosen);
  assert.equal(classifyProduct('manzana', chosen.shoppingCategoryOverrides), 'fruit');
  const unknown = setProductCategory(chosen, 'Fairy', 'unknown');
  assert.equal(classifyProduct('fairy', unknown.shoppingCategoryOverrides), 'unknown');
  const reset = setProductCategory(unknown, 'FAIRY', null);
  assert.equal(classifyProduct('Fairy', reset.shoppingCategoryOverrides), 'household');
  assert.equal(reset.shoppingCategoryOverrides.platano, 'other');
  assert.equal(setProductCategory(data, 'Fairy', 'invalid'), data);
  assert.equal(setProductCategory(data, '', 'other'), data);
  assert.equal(setProductCategory(data, 'Fairy', null), data);
});

test('learning an unknown product works after serialisation without polluting other products', () => {
  const chosen = setProductCategory({tickets: []}, 'Marca Nueva XYZ', 'household');
  const loaded = JSON.parse(JSON.stringify(chosen));
  assert.equal(classifyProduct('MARCA NUEVA XYZ', loaded.shoppingCategoryOverrides), 'household');
  assert.equal(classifyProduct('Otra marca XYZ', loaded.shoppingCategoryOverrides), 'unknown');
  assert.equal(classifyProduct('Marca Nueva XYZ', {}), 'unknown');
});

test('grouping preserves every row, quantity and checked state while sorting each group', () => {
  const items = [
    {id: '1', name: 'Plátano', quantity: '2 kg', checked: true},
    {id: '2', name: 'Manzana', quantity: '3', checked: false},
    {id: '3', name: 'Fairy', quantity: '1', checked: false},
    {id: '4', name: 'Hummus', quantity: '2', checked: false},
    {id: '5', name: 'Producto XYZ', quantity: '5', checked: false},
    {id: '6', name: 'Manzana', quantity: '1 kg', checked: false},
  ];
  const original = structuredClone(items);
  const groups = groupShoppingItems(items);
  assert.deepEqual(groups.map(group => group.id), ['fruit', 'household', 'other', 'unknown']);
  assert.deepEqual(groups[0].items.map(item => item.id), ['2', '6', '1']);
  assert.equal(groups.flatMap(group => group.items).length, items.length);
  assert.deepEqual(items, original);
  assert.deepEqual(groupShoppingItems([]), []);
  const data = setProductCategory({tickets: [{id: 'old', items}]}, 'Producto XYZ', 'household');
  const collected = collectPendingItems(data, 'new', '2026-10-20');
  const grouped = groupShoppingItems(collected.tickets[0].items, collected.shoppingCategoryOverrides);
  assert.ok(grouped.find(group => group.id === 'household').items.some(item => item.id === '5'));
  assert.equal(collected.tickets[1].items[0].id, '1');
  assert.deepEqual(shoppingCategories.map(group => group.id).slice(-2), ['other', 'unknown']);
});

function categoryDatabase(error = null) {
  const calls = [];
  return {calls, from(table) {
    assert.equal(table, 'shopping_product_categories');
    return {
      async upsert(rows, options) {calls.push({operation: 'upsert', rows, options}); return {error};},
      delete() {return {eq(column, household) {assert.equal(column, 'household_id'); return {async in(column, keys) {assert.equal(column, 'product_key'); calls.push({operation: 'delete', household, keys}); return {error};}};}};},
    };
  }};
}

test('sync persists only changed choices, scopes to household and resets only requested names', async () => {
  const client = categoryDatabase();
  await syncShoppingCategories(client, 'home-1', {fairy: 'household', platano: 'other', xyz: 'unknown'}, {fairy: 'household', platano: 'fruit', nuevo: 'hygiene'});
  assert.deepEqual(client.calls, [
    {operation: 'upsert', rows: [{household_id: 'home-1', product_key: 'platano', category: 'fruit'}, {household_id: 'home-1', product_key: 'nuevo', category: 'hygiene'}], options: {onConflict: 'household_id,product_key'}},
    {operation: 'delete', household: 'home-1', keys: ['xyz']},
  ]);
  const unchanged = categoryDatabase();
  await syncShoppingCategories(unchanged, 'home-2');
  await syncShoppingCategories(unchanged, 'home-2', {fairy: 'household'}, {fairy: 'household'});
  assert.equal(unchanged.calls.length, 0);
});

test('failed synchronisation reports errors and never continues with resets after a failed write', async () => {
  const client = categoryDatabase(new Error('Save failed'));
  await assert.rejects(syncShoppingCategories(client, 'home', {old: 'fruit'}, {new: 'meat'}), /Save failed/);
  assert.deepEqual(client.calls.map(call => call.operation), ['upsert']);
  await assert.rejects(syncShoppingCategories(categoryDatabase(new Error('Delete failed')), 'home', {old: 'fruit'}, {}), /Delete failed/);
});
