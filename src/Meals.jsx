import React, {useEffect, useRef, useState} from 'react';
import {DndContext, DragOverlay, PointerSensor, KeyboardSensor, pointerWithin, rectIntersection, useDraggable, useDroppable, useSensor, useSensors} from '@dnd-kit/core';
import {ChevronLeft, ChevronRight, Copy, Pencil, Trash2, Utensils} from 'lucide-react';
import {mealKey, monthDays, setMeal, transferMeal} from './meals.js';
import {localToday} from './shopping';

const labels = {lunch: 'Comida', dinner: 'Cena'};
const mealCollision = args => args.pointerCoordinates ? pointerWithin(args) : rectIntersection(args);

function MealSlot({date, slot, meal, selecting, editing, onEdit, onSave, onMenu, onSelect}) {
  const id = mealKey(date, slot);
  const {setNodeRef: dropRef, isOver} = useDroppable({id, data: {date, slot}});
  const {setNodeRef: dragRef, listeners, attributes, isDragging} = useDraggable({id, data: meal, disabled: !meal || editing || selecting});
  const [draft, setDraft] = useState(meal?.text || '');
  const input = useRef(null);
  useEffect(() => {setDraft(meal?.text || '');}, [meal?.text, editing]);
  useEffect(() => {if (editing) input.current?.focus();}, [editing]);
  return <div ref={dropRef} className={`meal-slot ${slot} ${isOver ? 'meal-over' : ''}`}>
    {selecting ? <button className="meal-target" onClick={() => onSelect(date, slot)} aria-label={`${labels[slot]} del ${date}${meal ? `: sustituir ${meal.text}` : ''}`}><small>{labels[slot]}</small><span>{meal?.text || 'Guardar aquí'}</span></button> : <>
      <small className="meal-label">{labels[slot]}</small>
      {meal && !editing ? <button ref={dragRef} {...listeners} {...attributes} className={`meal-entry ${isDragging ? 'meal-dragging' : ''}`} onClick={event => onMenu(event, meal)} onContextMenu={event => {event.preventDefault(); onMenu(event, meal);}} aria-label={`${labels[slot]} del ${date}: ${meal.text}`}>{meal.text}</button> : <textarea ref={input} rows={3} aria-label={`${labels[slot]} del ${date}`} placeholder={labels[slot]} value={draft} onFocus={onEdit} onChange={event => setDraft(event.target.value)} onBlur={() => onSave(draft)} onKeyDown={event => {
        if (event.key === 'Escape') {event.preventDefault(); setDraft(meal?.text || ''); onSave(meal?.text || '');}
        if (event.key === 'Enter' && !event.shiftKey) {event.preventDefault(); event.currentTarget.blur();}
      }}/>}
    </>}
  </div>;
}

export default function Meals({data, save}) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12));
  const [editing, setEditing] = useState(null);
  const [menu, setMenu] = useState(null);
  const [copying, setCopying] = useState(null);
  const [dragging, setDragging] = useState(null);
  const menuRef = useRef(null);
  const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 8}}), useSensor(KeyboardSensor));
  const meals = data.meals || [];
  const indexed = new Map(meals.map(meal => [mealKey(meal.date, meal.slot), meal]));
  useEffect(() => {
    const close = event => {if (!menuRef.current?.contains(event.target)) setMenu(null);};
    const escape = event => {if (event.key === 'Escape') {setMenu(null); setCopying(null);}};
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    if (menu) menuRef.current?.querySelector('button')?.focus();
    return () => {document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape);};
  }, [menu]);
  const update = (date, slot, text) => {
    save(current => ({...current, meals: setMeal(current.meals || [], date, slot, text)}));
    setEditing(null);
  };
  const transfer = (source, date, slot, move) => {
    if (!source || mealKey(source.date, source.slot) === mealKey(date, slot)) return;
    const target = indexed.get(mealKey(date, slot));
    if (target && !window.confirm(`¿Sustituir «${target.text}» por «${source.text}»?`)) return;
    save(current => ({...current, meals: transferMeal(current.meals || [], source, date, slot, move)}));
    setCopying(null);
  };
  return <section className="meals-page">
    <div className="page-title"><div><h1>Calendario de comidas</h1><p>Planifica tus comidas y cenas para cada día.</p></div><Utensils aria-hidden="true"/></div>
    <DndContext sensors={sensors} collisionDetection={mealCollision} onDragStart={({active}) => {setMenu(null); setCopying(null); setDragging(active.data.current);}} onDragCancel={() => setDragging(null)} onDragEnd={({over}) => {if (over) transfer(dragging, over.data.current.date, over.data.current.slot, true); setDragging(null);}}>
      <div className="calendar meal-calendar">
        <div className="calendar-toolbar"><button className="icon" aria-label="Mes anterior" onClick={() => setMonth(value => new Date(value.getFullYear(), value.getMonth() - 1, 1, 12))}><ChevronLeft/></button><h2 aria-live="polite">{month.toLocaleDateString('es-ES', {month: 'long', year: 'numeric'})}</h2><button className="icon" aria-label="Mes siguiente" onClick={() => setMonth(value => new Date(value.getFullYear(), value.getMonth() + 1, 1, 12))}><ChevronRight/></button><button className="secondary" onClick={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12))}>Hoy</button></div>
        <div className="meal-instructions" role="status">{copying || dragging ? <><span>{copying ? 'Copiar' : 'Mover'} «{(copying || dragging).text}»: arriba para comida, abajo para cena.</span>{copying && <button className="secondary" onClick={() => setCopying(null)}>Cancelar</button>}</> : 'Escribe en un espacio vacío. Pulsa un plato para ver sus opciones o arrástralo a otro día.'}</div>
        <div className="meal-calendar-scroll"><div className="meal-grid"><div className="meal-weekdays">{['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => <span key={day}>{day}</span>)}</div><div className="meal-days">{monthDays(month).map((date, index) => date ? <article key={date} className={`meal-day ${date === localToday() ? 'meal-today' : ''}`} aria-label={new Date(date + 'T12:00').toLocaleDateString('es-ES', {day: 'numeric', month: 'long'})}><time dateTime={date}>{Number(date.slice(-2))}</time><div className="meal-slots">{['lunch', 'dinner'].map(slot => <MealSlot key={slot} date={date} slot={slot} meal={indexed.get(mealKey(date, slot))} selecting={Boolean(copying || dragging)} editing={editing === mealKey(date, slot)} onEdit={() => setEditing(mealKey(date, slot))} onSave={text => update(date, slot, text)} onMenu={(event, meal) => setMenu({meal, x: Math.max(8, Math.min(event.clientX || event.currentTarget.getBoundingClientRect().left, window.innerWidth - 200)), y: Math.max(8, Math.min(event.clientY || event.currentTarget.getBoundingClientRect().bottom, window.innerHeight - 165))})} onSelect={(date, slot) => transfer(copying, date, slot, false)}/>)}</div></article> : <div key={`empty-${index}`} className="meal-day meal-blank"/>)}</div></div></div>
      </div>
      <DragOverlay>{dragging && <div className="meal-drag-preview">{dragging.text}</div>}</DragOverlay>
    </DndContext>
    {menu && <div ref={menuRef} className="meal-menu" role="group" aria-label={`Opciones de ${menu.meal.text}`} style={{left: menu.x, top: menu.y}}><button onClick={() => {setEditing(mealKey(menu.meal.date, menu.meal.slot)); setMenu(null);}}><Pencil size={16}/>Editar</button><button onClick={() => {setCopying(menu.meal); setMenu(null);}}><Copy size={16}/>Copiar en…</button><button className="danger" onClick={() => {update(menu.meal.date, menu.meal.slot, ''); setMenu(null);}}><Trash2 size={16}/>Borrar</button></div>}
  </section>;
}
