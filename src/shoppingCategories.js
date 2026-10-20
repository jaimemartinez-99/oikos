import {shoppingCatalogue} from './shoppingCatalogue.js';

export const shoppingCategories = [
  {id: 'fruit', label: 'Fruta'},
  {id: 'vegetables', label: 'Verdura y hortalizas'},
  {id: 'meat', label: 'Carne y embutidos'},
  {id: 'fish', label: 'Pescado y marisco'},
  {id: 'dairy', label: 'Lácteos y huevos'},
  {id: 'grains', label: 'Pan, pasta y cereales'},
  {id: 'legumes', label: 'Legumbres'},
  {id: 'drinks', label: 'Bebidas'},
  {id: 'household', label: 'Limpieza y hogar'},
  {id: 'hygiene', label: 'Higiene personal'},
  {id: 'other', label: 'Otros'},
  {id: 'unknown', label: 'Desconocido'},
];
const categoryIds = new Set(shoppingCategories.map(category => category.id));

export const normalizeProductName = name => String(name ?? '').normalize('NFD')
  .replace(/\p{M}/gu, '').toLocaleLowerCase('es-ES')
  .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');

const aliases = Object.entries(shoppingCatalogue).flatMap(([category, sources]) =>
  Object.entries(sources).flatMap(([source, text]) => text.split('|')
    .map(name => ({name: normalizeProductName(name), category, source})).filter(alias => alias.name)));

// Recognise Spanish plurals from known vocabulary, without blindly stripping
// suffixes: arroz, gas and maíz must stay intact. Brand spellings are preserved.
const stopWords = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'para', 'con', 'sin', 'en', 'al', 'and']);
const singulars = new Map();
for (const word of new Set(aliases.filter(alias => alias.source === 'products').flatMap(alias => alias.name.split(' ')))) {
  if (word.length < 3 || stopWords.has(word) || /s$/.test(word)) continue;
  const plural = word.endsWith('z') ? word.slice(0, -1) + 'ces' : /[aeiou]$/.test(word) ? word + 's' : word + 'es';
  if (!singulars.has(plural) || singulars.get(plural).length > word.length) singulars.set(plural, word);
}
export const productCategoryKey = name => normalizeProductName(name).split(' ').map(word => singulars.get(word) || word).join(' ');

const index = new Map();
let maxWords = 1;
for (const alias of aliases) {
  const key = productCategoryKey(alias.name);
  if (!index.has(key)) index.set(key, new Set());
  index.get(key).add(alias.category);
  maxWords = Math.max(maxWords, key.split(' ').length);
}

// One insertion, deletion, substitution or adjacent transposition. Short words
// and matches tied across categories are deliberately never guessed.
function oneTypo(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a === b) return true;
  if (a.slice(0, 2) !== b.slice(0, 2)) return false;
  let i = 0;
  while (i < Math.min(a.length, b.length) && a[i] === b[i]) i++;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1) ||
    (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2));
  const [short, long] = a.length < b.length ? [a, b] : [b, a];
  return short.slice(i) === long.slice(i + 1);
}
const fuzzyIndex = new Map(index);
for (const [plural, singular] of singulars) if (index.has(singular) && !fuzzyIndex.has(plural)) fuzzyIndex.set(plural, index.get(singular));
const fuzzyWords = [...fuzzyIndex].filter(([key, categories]) => !key.includes(' ') && key.length >= 5 && categories.size === 1);
const modifiers = new Set(['marca', 'pack', 'paquete', 'paquetes', 'bolsa', 'bolsas', 'bote', 'botes', 'botella', 'botellas', 'lata', 'latas', 'tarro', 'tarros', 'fresco', 'fresca', 'frescos', 'frescas', 'natural', 'naturales', 'integral', 'congelado', 'congelada', 'grande', 'grandes', 'pequeño', 'pequeña', 'unidad', 'unidades', 'litro', 'litros', 'gramos', 'kilos']);
const automaticCache = new Map();
const genericCuts = new Set(['filete', 'lomo', 'solomillo', 'pechuga', 'hamburguesa', 'albondiga', 'brocheta']);

function automaticCategory(key) {
  const words = key.split(' ');
  let ambiguous = false;
  let cutCategory = null;
  // Use the first recognisable product/brand and its longest phrase. This keeps
  // yogur de fresa and Fairy limón with the main product, not its ingredient.
  for (let start = 0; start < words.length; start++) {
    for (let size = Math.min(maxWords, words.length - start); size > 0; size--) {
      const categories = index.get(words.slice(start, start + size).join(' '));
      if (!categories) continue;
      if (categories.size === 1) {
        const category = [...categories][0];
        if (size === 1 && genericCuts.has(words[start])) {cutCategory = category; break;}
        return category;
      }
      ambiguous = true;
      break;
    }
  }
  if (ambiguous) return 'unknown';
  if (cutCategory) return cutCategory;
  const matches = new Set();
  for (const word of words) {
    if (word.length < 5 || modifiers.has(word)) continue;
    for (const [candidate, categories] of fuzzyWords) {
      if (oneTypo(word, candidate)) matches.add([...categories][0]);
    }
  }
  return matches.size === 1 ? [...matches][0] : 'unknown';
}

export function classifyProduct(name, overrides = {}) {
  const key = productCategoryKey(name);
  if (!key) return 'unknown';
  if (Object.hasOwn(overrides, key) && categoryIds.has(overrides[key])) return overrides[key];
  if (!automaticCache.has(key)) {
    if (automaticCache.size >= 2000) automaticCache.clear();
    automaticCache.set(key, automaticCategory(key));
  }
  return automaticCache.get(key);
}

export function groupShoppingItems(items, overrides = {}) {
  const groups = new Map(shoppingCategories.map(category => [category.id, {...category, items: []}]));
  for (const item of items) groups.get(classifyProduct(item.name, overrides)).items.push(item);
  return [...groups.values()].filter(group => group.items.length).map(group => ({...group,
    items: group.items.sort((a, b) => Number(a.checked) - Number(b.checked) || a.name.localeCompare(b.name, 'es', {sensitivity: 'base'})),
  }));
}

export function setProductCategory(data, name, category) {
  const key = productCategoryKey(name);
  if (!key || (category !== null && !categoryIds.has(category))) return data;
  const current = data.shoppingCategoryOverrides || {};
  if (category === null ? !Object.hasOwn(current, key) : current[key] === category) return data;
  const overrides = {...current};
  if (category === null) delete overrides[key];
  else overrides[key] = category;
  return {...data, shoppingCategoryOverrides: overrides};
}

export async function syncShoppingCategories(client, householdId, before = {}, after = {}) {
  if (before === after) return;
  const changed = Object.entries(after).filter(([key, category]) => before[key] !== category)
    .map(([product_key, category]) => ({household_id: householdId, product_key, category}));
  if (changed.length) {
    const {error} = await client.from('shopping_product_categories').upsert(changed, {onConflict: 'household_id,product_key'});
    if (error) throw error;
  }
  const removed = Object.keys(before).filter(key => !Object.hasOwn(after, key));
  if (removed.length) {
    const {error} = await client.from('shopping_product_categories').delete().eq('household_id', householdId).in('product_key', removed);
    if (error) throw error;
  }
}
