export const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export function collectPendingItems(data, ticketId, date = localToday()) {
  const items = data.tickets.flatMap(ticket => ticket.items.filter(item => !item.checked));
  if (!items.length) return data;
  return {
    ...data,
    tickets: [
      {id: ticketId, date, items},
      ...data.tickets.map(ticket => ({...ticket, items: ticket.items.filter(item => item.checked)})),
    ],
  };
}

// Create destinations before moving rows, and delete only items absent everywhere.
export async function syncShoppingTickets(client, before, after) {
  if (before.tickets === after.tickets) return;
  const check = result => { if (result.error) throw result.error; };
  const oldTickets = new Set(before.tickets.map(ticket => ticket.id));
  const nextTickets = new Set(after.tickets.map(ticket => ticket.id));
  const oldItems = new Map(before.tickets.flatMap(ticket => ticket.items.map(item => [item.id, {...item, ticketId: ticket.id}])));
  const nextItems = new Set(after.tickets.flatMap(ticket => ticket.items.map(item => item.id)));
  const addedTickets = after.tickets.filter(ticket => !oldTickets.has(ticket.id));
  if (addedTickets.length) check(await client.from('shopping_tickets').insert(addedTickets.map(ticket => ({
    id: ticket.id, household_id: after.householdId, date: ticket.date, created_by: after.currentUser,
  }))));

  for (const ticket of after.tickets) {
    const moved = ticket.items.filter(item => oldItems.has(item.id) && oldItems.get(item.id).ticketId !== ticket.id);
    if (moved.length) check(await client.from('shopping_items').update({ticket_id: ticket.id}).in('id', moved.map(item => item.id)));
    const added = ticket.items.filter(item => !oldItems.has(item.id));
    if (added.length) check(await client.from('shopping_items').insert(added.map(item => ({
      id: item.id, ticket_id: ticket.id, product_name: item.name, quantity: item.quantity, checked: item.checked,
    }))));
    for (const item of ticket.items) {
      const prev = oldItems.get(item.id);
      if (prev && (prev.checked !== item.checked || prev.quantity !== item.quantity || prev.name !== item.name)) {
        check(await client.from('shopping_items').update({product_name: item.name, quantity: item.quantity, checked: item.checked}).eq('id', item.id));
      }
    }
  }
  const removedItems = [...oldItems.keys()].filter(id => !nextItems.has(id));
  if (removedItems.length) check(await client.from('shopping_items').delete().in('id', removedItems));
  const removedTickets = [...oldTickets].filter(id => !nextTickets.has(id));
  if (removedTickets.length) check(await client.from('shopping_tickets').delete().in('id', removedTickets));
}
