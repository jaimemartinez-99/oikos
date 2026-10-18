import test from 'node:test';
import assert from 'node:assert/strict';
import {monthDays, setMeal, transferMeal, syncMeals} from '../src/meals.js';

const lunch = {date: '2026-10-01', slot: 'lunch', text: 'Lentejas con verduras'};
const dinner = {date: '2026-10-02', slot: 'dinner', text: 'Tortilla'};

test('monthly grid starts on Monday, includes leap days and complete weeks', () => {
  const october = monthDays(new Date(2026, 9, 1));
  assert.deepEqual(october.slice(0, 4), [null, null, null, '2026-10-01']);
  assert.equal(october.length % 7, 0);
  assert.equal(october.filter(Boolean).length, 31);
  assert.ok(monthDays(new Date(2028, 1, 1)).includes('2028-02-29'));
  assert.equal(monthDays(new Date(2026, 1, 1)).filter(Boolean).length, 28);
});

test('create, edit and erase only the chosen slot', () => {
  const meals = [lunch, dinner];
  const edited = setMeal(meals, lunch.date, lunch.slot, '  Arroz\ncon verduras  ');
  assert.equal(edited.length, 2);
  assert.equal(edited[1].text, 'Arroz\ncon verduras');
  assert.deepEqual(setMeal(edited, lunch.date, lunch.slot, '  '), [dinner]);
  assert.equal(meals[0].text, lunch.text);
});

test('copy across months and slots keeps the original and replaces destination', () => {
  const copied = transferMeal([lunch, dinner], lunch, dinner.date, dinner.slot, false);
  assert.equal(copied.length, 2);
  assert.deepEqual(copied[0], lunch);
  assert.equal(copied[1].text, lunch.text);
  assert.equal(transferMeal(copied, lunch, '2026-11-01', 'dinner', false).length, 3);
});

test('moving removes original, supports same-day slot changes, and ignores self or stale sources', () => {
  assert.deepEqual(transferMeal([lunch, dinner], lunch, dinner.date, dinner.slot, true), [{...dinner, text: lunch.text}]);
  assert.deepEqual(transferMeal([lunch], lunch, lunch.date, 'dinner', true), [{...lunch, slot: 'dinner'}]);
  const meals = [lunch];
  assert.equal(transferMeal(meals, lunch, lunch.date, lunch.slot, true), meals);
  assert.equal(transferMeal(meals, dinner, lunch.date, lunch.slot, true), meals);
});

test('persistence writes destination before deleting source and scopes every operation to household', async () => {
  const calls = [];
  const client = {from(table) {
    const call = {table, filters: {}};
    const query = {
      upsert(row, options) {Object.assign(call, {action: 'upsert', row, options}); calls.push(call); return Promise.resolve({error: null});},
      delete() {call.action = 'delete'; calls.push(call); return query;},
      eq(key, value) {call.filters[key] = value; return query;},
      then(resolve) {return Promise.resolve({error: null}).then(resolve);},
    };
    return query;
  }};
  await syncMeals(client, 'home', [lunch], [{...dinner, text: lunch.text}]);
  assert.deepEqual(calls.map(call => call.action), ['upsert', 'delete']);
  assert.equal(calls[0].row.household_id, 'home');
  assert.deepEqual(calls[1].filters, {household_id: 'home', date: lunch.date, slot: lunch.slot});
  calls.length = 0;
  await syncMeals(client, 'home', [lunch], [lunch]);
  assert.equal(calls.length, 0);
});

test('failed destination write never deletes the source', async () => {
  let deleted = false;
  const client = {from() {return {
    upsert: async () => ({error: new Error('offline')}),
    delete() {deleted = true;},
  };}};
  await assert.rejects(syncMeals(client, 'home', [lunch], [dinner]), /offline/);
  assert.equal(deleted, false);
});
