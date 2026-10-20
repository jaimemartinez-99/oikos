import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Copy, ListChecks, Plus, Trash2} from 'lucide-react';
import PriceComparison from './PriceComparison';
import ShoppingItem from './ShoppingItem';
import ShoppingCategoryMenu from './ShoppingCategoryMenu';
import {collectPendingItems, localToday} from './shopping.js';
import {classifyProduct, groupShoppingItems, productCategoryKey, setProductCategory} from './shoppingCategories.js';

const uid = () => crypto.randomUUID();
const formatDate = date => new Date(date + 'T12:00').toLocaleDateString('es-ES');

export default function Shopping({data, save}) {
  const [newDate, setNewDate] = useState(localToday());
  const [drafts, setDrafts] = useState({});
  const [comparedItem, setComparedItem] = useState(null);
  const [menu, setMenu] = useState(null);
  const menuTrigger = useRef(null);
  const overrides = data.shoppingCategoryOverrides || {};
  const tickets = useMemo(() => data.tickets.map(ticket => ({...ticket, groups: groupShoppingItems(ticket.items, data.shoppingCategoryOverrides)})), [data.tickets, data.shoppingCategoryOverrides]);
  const suggestions = [...new Set(data.tickets.flatMap(ticket => ticket.items.map(item => item.name)))];
  const hasPending = data.tickets.some(ticket => ticket.items.some(item => !item.checked));
  const create = () => {if (newDate) save(current => ({...current, tickets: [{id: uid(), date: newDate, items: []}, ...current.tickets]}));};
  const collect = () => {const id = uid(); save(current => collectPendingItems(current, id)); setMenu(null);};
  const add = ticketId => {
    const name = (drafts[ticketId] || '').trim();
    if (!name) return;
    const id = uid();
    save(current => ({...current, tickets: current.tickets.map(ticket => ticket.id === ticketId ? {...ticket, items: [...ticket.items, {id, name, quantity: '1', checked: false}]} : ticket)}));
    setDrafts(current => ({...current, [ticketId]: ''}));
  };
  const update = (ticketId, itemId, changes) => save(current => ({...current, tickets: current.tickets.map(ticket => ticket.id === ticketId ? {...ticket, items: ticket.items.map(item => item.id === itemId ? {...item, ...changes} : item)} : ticket)}));
  const removeTicket = ticket => {
    if (!window.confirm(`¿Borrar el ticket del ${formatDate(ticket.date)} y todos sus productos? Esta acción no se puede deshacer.`)) return;
    save(current => ({...current, tickets: current.tickets.filter(row => row.id !== ticket.id)}));
    setDrafts(current => {const next = {...current}; delete next[ticket.id]; return next;});
    setMenu(null);
  };
  const openMenu = (event, item) => {
    event.preventDefault();
    const row = event.currentTarget.closest('[data-shopping-item]');
    const trigger = row?.querySelector('[data-category-trigger]');
    menuTrigger.current = trigger;
    const bounds = trigger?.getBoundingClientRect() || event.currentTarget.getBoundingClientRect();
    setMenu({item, x: event.clientX || bounds.left, y: event.clientY || bounds.bottom, trigger});
  };
  const closeMenu = useCallback(() => {
    menuTrigger.current?.focus({preventScroll: true});
    setMenu(null);
  }, []);
  const selectCategory = category => {
    save(current => setProductCategory(current, menu.item.name, category));
    const id = menu.item.id;
    setMenu(null);
    // The row can move to a different group after categorising it.
    requestAnimationFrame(() => document.querySelector(`[data-shopping-item="${CSS.escape(id)}"] [data-category-trigger]`)?.focus({preventScroll: true}));
  };

  return <section>
    <div className="page-title"><div><h1>Lista de la compra</h1><p>Organiza tus compras por ticket y categoría.</p></div><div className="shopping-actions">
      <div className="inline"><input type="date" aria-label="Fecha del nuevo ticket" value={newDate} onChange={event => setNewDate(event.target.value)}/><button disabled={!newDate} onClick={create}><Plus/>Nuevo ticket</button></div>
      <button className="secondary" disabled={!hasPending} onClick={collect} title={hasPending ? 'Trasladar todos los productos sin marcar a un nuevo ticket con la fecha de hoy' : 'No hay productos pendientes'}><ListChecks size={20}/>Reunir pendientes</button>
    </div></div>
    <p className="shopping-category-hint">Clic derecho sobre un producto para cambiar su categoría. En móvil, pulsa el botón de categorías o mantén pulsado el nombre.</p>
    <div className="tickets">{tickets.map(ticket => <article className="ticket" key={ticket.id}>
      <div className="ticket-head"><div><small>TICKET</small><h2>{new Date(ticket.date + 'T12:00').toLocaleDateString('es-ES', {weekday: 'long', day: 'numeric', month: 'long'})}</h2></div><div className="ticket-actions">
        <button className="icon" title="Duplicar ticket" aria-label={`Duplicar ticket del ${formatDate(ticket.date)}`} onClick={() => save(current => ({...current, tickets: [{id: uid(), date: localToday(), items: ticket.items.map(item => ({...item, id: uid(), checked: false}))}, ...current.tickets]}))}><Copy size={18}/></button>
        <button className="icon danger" title="Borrar ticket" aria-label={`Borrar ticket del ${formatDate(ticket.date)}`} onClick={() => removeTicket(ticket)}><Trash2 size={18}/></button>
      </div></div>
      <div className="shopping-groups">{ticket.groups.map(group => <section className={`shopping-group shopping-group-${group.id}`} key={group.id} aria-label={group.label}>
        <h3>{group.label}<small>{group.items.length}</small></h3>
        <ul>{group.items.map(item => <ShoppingItem key={item.id} item={item}
          onUpdate={changes => update(ticket.id, item.id, changes)}
          onCompare={() => setComparedItem(item)} onCategorize={event => openMenu(event, item)}
          onDelete={() => save(current => ({...current, tickets: current.tickets.map(row => row.id === ticket.id ? {...row, items: row.items.filter(product => product.id !== item.id)} : row)}))}
        />)}</ul>
      </section>)}</div>
      {!ticket.items.length && <p className="shopping-ticket-empty">Añade el primer producto a este ticket.</p>}
      <div className="add-row"><input list="products" aria-label="Añadir producto" placeholder="Añadir producto" value={drafts[ticket.id] || ''} onChange={event => setDrafts(current => ({...current, [ticket.id]: event.target.value}))} onKeyDown={event => {if (event.key === 'Enter') add(ticket.id);}}/><button className="icon" aria-label="Añadir producto al ticket" onClick={() => add(ticket.id)}><Plus size={20}/></button></div>
    </article>)}</div>
    {!data.tickets.length && <p className="empty">No hay tickets. Crea uno para empezar tu lista de la compra.</p>}
    <datalist id="products">{suggestions.map(name => <option key={name} value={name}/>)}</datalist>
    {comparedItem && <PriceComparison item={comparedItem} onClose={() => setComparedItem(null)}/>}
    {menu && <ShoppingCategoryMenu item={menu.item} category={classifyProduct(menu.item.name, overrides)} custom={Object.hasOwn(overrides, productCategoryKey(menu.item.name))} x={menu.x} y={menu.y} onSelect={selectCategory} onClose={closeMenu}/>}
  </section>;
}
