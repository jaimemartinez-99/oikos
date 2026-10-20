import React, {useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {Check, RotateCcw} from 'lucide-react';
import {shoppingCategories} from './shoppingCategories.js';

export default function ShoppingCategoryMenu({item, category, custom, x, y, onSelect, onClose}) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({left: x, top: y});
  useLayoutEffect(() => {
    const menu = menuRef.current;
    const reposition = () => {
      const bounds = menu.getBoundingClientRect();
      const next = {left: Math.max(8, Math.min(x, window.innerWidth - bounds.width - 8)), top: Math.max(8, Math.min(y, window.innerHeight - bounds.height - 8))};
      setPosition(current => current.left === next.left && current.top === next.top ? current : next);
    };
    reposition();
    // Web-font loading and long names can change the menu's measured height.
    const observer = new ResizeObserver(reposition);
    observer.observe(menu);
    menu.querySelector('[aria-checked="true"]')?.focus({preventScroll: true});
    const outside = event => {if (!menu.contains(event.target)) onClose();};
    const scroll = event => {if (!menu.contains(event.target)) onClose();};
    document.addEventListener('pointerdown', outside);
    document.addEventListener('wheel', scroll, {capture: true, passive: true});
    document.addEventListener('touchmove', scroll, {capture: true, passive: true});
    window.addEventListener('resize', onClose);
    return () => {
      observer.disconnect();
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('wheel', scroll, true);
      document.removeEventListener('touchmove', scroll, true);
      window.removeEventListener('resize', onClose);
    };
  }, [x, y, onClose]);

  const navigate = event => {
    const options = [...menuRef.current.querySelectorAll('[role^="menuitem"]')];
    const current = options.indexOf(document.activeElement);
    if (event.key === 'Escape' || event.key === 'Tab') {if (event.key === 'Escape') event.preventDefault(); onClose(); return;}
    const next = event.key === 'ArrowDown' ? (current + 1) % options.length
      : event.key === 'ArrowUp' ? (current - 1 + options.length) % options.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : null;
    if (next !== null) {event.preventDefault(); options[next].focus();}
  };

  return createPortal(<div ref={menuRef} className="shopping-category-menu" style={position} role="menu" aria-label={`Categorizar ${item.name}`} onKeyDown={navigate}>
    <div className="shopping-category-menu-title">Categorizar <strong>{item.name}</strong></div>
    <div className="shopping-category-options" role="group" aria-label="Categorías">
      {shoppingCategories.map(option => <button type="button" key={option.id} role="menuitemradio" aria-checked={category === option.id} onClick={() => onSelect(option.id)}>
        <span>{option.label}</span>{category === option.id && <Check size={15} aria-hidden="true"/>}
      </button>)}
    </div>
    {custom && <button type="button" className="shopping-category-reset" role="menuitem" onClick={() => onSelect(null)}><RotateCcw size={15}/>Volver a detección automática</button>}
    <p>Tu elección se recordará para este producto.</p>
  </div>, document.body);
}
