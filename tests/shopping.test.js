import test from 'node:test';
import assert from 'node:assert/strict';
import {collectPendingItems, localToday, syncShoppingTickets} from '../src/shopping.js';

const fixture = () => ({householdId: 'home', currentUser: 'user', notes: [], tickets: [
  {id: 'old1', date: '2026-10-01', items: [
    {id: 'milk1', name: 'Leche', quantity: '2 l', checked: false},
    {id: 'bread', name: 'Pan', quantity: '1', checked: true},
  ]},
  {id: 'old2', date: '2026-10-02', items: [{id: 'milk2', name: 'Leche', quantity: '1 l', checked: false}]},
  {id: 'empty', date: '2026-10-03', items: []},
]});

function database(data, failOperation = () => false) {
  const tables = {
    shopping_tickets: new Map(data.tickets.map(ticket => [ticket.id, {id: ticket.id}])),
    shopping_items: new Map(data.tickets.flatMap(ticket => ticket.items.map(item => [item.id, {
      id: item.id, ticket_id: ticket.id, product_name: item.name, quantity: item.quantity, checked: item.checked,
    }]))),
  };
  const calls = [];
  return {tables, calls, from(table) {
    const query = {table, operation: null, payload: null, ids: null};
    const builder = {
      insert(payload) {query.operation = 'insert'; query.payload = payload; return builder;},
      update(payload) {query.operation = 'update'; query.payload = payload; return builder;},
      delete() {query.operation = 'delete'; return builder;},
      eq(column, id) {assert.equal(column, 'id'); query.ids = [id]; return builder;},
      in(column, ids) {assert.equal(column, 'id'); query.ids = ids; return builder;},
      then(resolve, reject) {
        return Promise.resolve().then(() => {
          calls.push(query);
          if (failOperation(query)) return {error: new Error('Save failed')};
          if (query.operation === 'insert') {
            for (const row of query.payload) {
              assert.ok(!tables[table].has(row.id), 'No duplicate identifiers');
              if (table === 'shopping_items') assert.ok(tables.shopping_tickets.has(row.ticket_id));
              tables[table].set(row.id, {...row});
            }
          } else {
            for (const id of query.ids) {
              if (query.operation === 'delete') {
                if (table === 'shopping_tickets') assert.ok(![...tables.shopping_items.values()].some(item => item.ticket_id === id), 'Remove products before their ticket');
                tables[table].delete(id);
              }
              else {
                assert.ok(tables[table].has(id));
                if (query.payload.ticket_id) assert.ok(tables.shopping_tickets.has(query.payload.ticket_id), 'Destination exists');
                Object.assign(tables[table].get(id), query.payload);
              }
            }
          }
          return {error: null};
        }).then(resolve, reject);
      },
    };
    return builder;
  }};
}

test('moves all pending rows, preserves quantities and duplicates, and leaves purchased rows', () => {
  const before = fixture();
  const original = structuredClone(before);
  const after = collectPendingItems(before, 'new', '2026-10-14');
  assert.deepEqual(after.tickets[0], {id: 'new', date: '2026-10-14', items: [original.tickets[0].items[0], original.tickets[1].items[0]]});
  assert.deepEqual(after.tickets.slice(1).map(ticket => ticket.items.map(item => item.id)), [['bread'], [], []]);
  assert.deepEqual(before, original);
  assert.equal(after.notes, before.notes);
});

test('does not create an empty ticket without pending products', () => {
  for (const tickets of [[], [{id: 'old', items: [{id: 'bread', checked: true}]}]]) {
    const data = {tickets};
    assert.equal(collectPendingItems(data, 'new'), data);
  }
});

test('repeating the action moves each product once', () => {
  const first = collectPendingItems(fixture(), 'new1', '2026-10-14');
  const second = collectPendingItems(first, 'new2', '2026-10-14');
  assert.deepEqual(second.tickets.flatMap(ticket => ticket.items.map(item => item.id)).sort(), ['bread', 'milk1', 'milk2']);
  assert.equal(second.tickets.find(ticket => ticket.id === 'new1').items.length, 0);
});

test('uses the local calendar day near midnight instead of the UTC day', t => {
  const NativeDate = Date;
  const previousTZ = process.env.TZ;
  process.env.TZ = 'Europe/Madrid';
  globalThis.Date = class extends NativeDate {constructor() {super('2026-10-13T22:30:00Z');}};
  t.after(() => {
    globalThis.Date = NativeDate;
    if (previousTZ === undefined) delete process.env.TZ;
    else process.env.TZ = previousTZ;
  });
  assert.equal(localToday(), '2026-10-14');
  assert.equal(collectPendingItems(fixture(), 'new').tickets[0].date, '2026-10-14');
});

test('persists the move by updating existing rows after creating the ticket', async () => {
  const before = fixture();
  const after = collectPendingItems(before, 'new', '2026-10-14');
  const db = database(before);
  await syncShoppingTickets(db, before, after);
  assert.equal(db.tables.shopping_items.size, 3);
  assert.equal(db.tables.shopping_items.get('milk1').ticket_id, 'new');
  assert.equal(db.tables.shopping_items.get('milk2').ticket_id, 'new');
  assert.equal(db.tables.shopping_items.get('bread').ticket_id, 'old1');
  assert.equal(db.tables.shopping_tickets.get('new').date, '2026-10-14');
  assert.deepEqual(db.calls.map(call => [call.table, call.operation]), [['shopping_tickets', 'insert'], ['shopping_items', 'update']]);
});

test('normal creation, editing, duplication and deletion still persist', async () => {
  const before = fixture();
  const after = structuredClone(before);
  after.tickets[0].items = [{...after.tickets[0].items[0], name: 'Leche entera', quantity: '3 l', checked: true}];
  after.tickets.push({id: 'duplicate', date: '2026-10-14', items: [{...before.tickets[0].items[0], id: 'milk-copy'}]});
  after.tickets = after.tickets.filter(ticket => ticket.id !== 'empty');
  const db = database(before);
  await syncShoppingTickets(db, before, after);
  assert.deepEqual(db.tables.shopping_items.get('milk1'), {id: 'milk1', ticket_id: 'old1', product_name: 'Leche entera', quantity: '3 l', checked: true});
  assert.equal(db.tables.shopping_items.get('milk-copy').ticket_id, 'duplicate');
  assert.ok(!db.tables.shopping_items.has('bread'));
  assert.ok(!db.tables.shopping_tickets.has('empty'));
});

test('a failed move throws without deleting or duplicating products', async () => {
  const before = fixture();
  const db = database(before, query => query.operation === 'update');
  await assert.rejects(syncShoppingTickets(db, before, collectPendingItems(before, 'new')), /Save failed/);
  assert.equal(db.tables.shopping_items.size, 3);
  assert.equal(db.tables.shopping_items.get('milk1').ticket_id, 'old1');
  assert.ok(!db.calls.some(call => call.operation === 'delete'));
});

test('deleting a populated ticket removes its products and preserves the other tickets', async () => {
  const before = fixture();
  const after = {...before, tickets: before.tickets.filter(ticket => ticket.id !== 'old1')};
  const db = database(before);
  await syncShoppingTickets(db, before, after);
  assert.deepEqual([...db.tables.shopping_tickets.keys()], ['old2', 'empty']);
  assert.deepEqual([...db.tables.shopping_items.values()], [{id: 'milk2', ticket_id: 'old2', product_name: 'Leche', quantity: '1 l', checked: false}]);
  assert.deepEqual(db.calls.map(call => [call.table, call.operation]), [['shopping_items', 'delete'], ['shopping_tickets', 'delete']]);
});

test('a failed product deletion keeps its ticket and reports the error', async () => {
  const before = fixture();
  const after = {...before, tickets: before.tickets.filter(ticket => ticket.id !== 'old1')};
  const db = database(before, query => query.table === 'shopping_items' && query.operation === 'delete');
  await assert.rejects(syncShoppingTickets(db, before, after), /Save failed/);
  assert.equal(db.tables.shopping_tickets.size, 3);
  assert.equal(db.tables.shopping_items.size, 3);
  assert.ok(!db.calls.some(call => call.table === 'shopping_tickets'));
});
