import React, {useEffect, useRef, useState} from 'react';
import {Check, Pencil, Search, Tags, Trash2} from 'lucide-react';

export default function ShoppingItem({item, onUpdate, onDelete, onCompare, onCategorize}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({name: '', quantity: ''});
  const press = useRef(null);
  useEffect(() => () => clearTimeout(press.current?.timer), []);
  const cancelPress = () => {clearTimeout(press.current?.timer); press.current = null;};
  const startPress = event => {
    if (event.pointerType !== 'touch' || editing || event.target.closest('button, input, textarea')) return;
    const target = event.currentTarget;
    const {clientX: x, clientY: y} = event;
    press.current = {x, y, timer: setTimeout(() => {onCategorize({preventDefault() {}, currentTarget: target, clientX: x, clientY: y}); press.current = null;}, 600)};
  };
  const startEditing = () => {
    setDraft({name: item.name, quantity: item.quantity ?? '1'});
    setEditing(true);
  };
  const submit = event => {
    event.preventDefault();
    const name = draft.name.trim();
    const quantity = draft.quantity.trim();
    if (!name || !quantity) return;
    onUpdate({name, quantity});
    setEditing(false);
  };

  return <li className={editing ? 'shopping-item editing' : 'shopping-item'} data-shopping-item={item.id}
    onContextMenu={event => {if (!editing) {cancelPress(); onCategorize(event);}}}
    onPointerDown={startPress} onPointerUp={cancelPress} onPointerCancel={cancelPress} onPointerLeave={cancelPress}
    onPointerMove={event => {if (press.current && Math.hypot(event.clientX - press.current.x, event.clientY - press.current.y) > 10) cancelPress();}}>
    {editing ? <form className="shopping-item-form" onSubmit={submit} onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); setEditing(false); }
    }}>
      <label>Producto<input autoFocus required list="products" value={draft.name} onChange={event => setDraft({...draft, name: event.target.value})}/></label>
      <label>Cantidad<input required placeholder="Ej.: 2 l" value={draft.quantity} onChange={event => setDraft({...draft, quantity: event.target.value})}/></label>
      <div className="shopping-item-form-actions">
        <button type="button" className="secondary" onClick={() => setEditing(false)}>Cancelar</button>
        <button type="submit" disabled={!draft.name.trim() || !draft.quantity.trim()}>Guardar</button>
      </div>
    </form> : <>
      <button className={'check '+(item.checked ? 'done' : '')} aria-label={`Marcar ${item.name} como ${item.checked ? 'pendiente' : 'comprado'}`} aria-pressed={item.checked} onClick={() => onUpdate({checked: !item.checked})}>{item.checked && <Check size={14}/>}</button>
      <span className={item.checked ? 'strike' : ''}>{item.name}</span><small>{item.quantity}</small>
      <div className="shopping-item-actions">
        <button className="icon" data-category-trigger title={`Categorizar ${item.name}`} aria-label={`Categorizar ${item.name}`} aria-haspopup="menu" onClick={onCategorize}><Tags size={16}/></button>
        <button className="icon" title={`Editar ${item.name}`} aria-label={`Editar ${item.name}`} onClick={startEditing}><Pencil size={16}/></button>
        <button className="icon" title={`Comparar precios de ${item.name}`} aria-label={`Comparar precios de ${item.name}`} onClick={onCompare}><Search size={16}/></button>
        <button className="icon danger" title={`Borrar ${item.name}`} aria-label={`Borrar ${item.name}`} onClick={onDelete}><Trash2 size={15}/></button>
      </div>
    </>}
  </li>;
}
