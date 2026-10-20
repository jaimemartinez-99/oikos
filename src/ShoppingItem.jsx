import React, {useState} from 'react';
import {Check, Pencil, Search, Trash2} from 'lucide-react';

export default function ShoppingItem({item, onUpdate, onDelete, onCompare}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({name: '', quantity: ''});
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

  return <li className={editing ? 'shopping-item editing' : 'shopping-item'}>
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
        <button className="icon" title={`Editar ${item.name}`} aria-label={`Editar ${item.name}`} onClick={startEditing}><Pencil size={16}/></button>
        <button className="icon" title={`Comparar precios de ${item.name}`} aria-label={`Comparar precios de ${item.name}`} onClick={onCompare}><Search size={16}/></button>
        <button className="icon danger" title={`Borrar ${item.name}`} aria-label={`Borrar ${item.name}`} onClick={onDelete}><Trash2 size={15}/></button>
      </div>
    </>}
  </li>;
}
