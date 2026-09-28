import React, {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {supabase, supabaseReady} from './supabase';

const storeLinks = {
  Alcampo: query => `https://www.compraonline.alcampo.es/search?q=${encodeURIComponent(query)}`,
  Mercadona: query => `https://tienda.mercadona.es/search-results?query=${encodeURIComponent(query)}`,
  'Supermercados BM': query => `https://www.online.bmsupermercados.es/es/s/${encodeURIComponent(query)}`,
};
const currency = value => Number(value).toLocaleString('es-ES', {style: 'currency', currency: 'EUR'});

export default function PriceComparison({item, onClose}) {
  const [query, setQuery] = useState(item.name);
  const [search, setSearch] = useState(item.name);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKeyDown = event => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!supabaseReady) return;
    let active = true;
    setLoading(true);
    setError('');
    setResult(null);
    supabase.functions.invoke('compare-prices', {body: {query: search}}).then(({data, error}) => {
      if (!active) return;
      if (error || data?.error) setError(data?.error || error?.message || 'No se pudo consultar el catálogo.');
      else setResult(data);
    }).catch(cause => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search]);

  return createPortal(
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="bulk-modal price-modal" role="dialog" aria-modal="true" aria-labelledby="price-modal-title" onMouseDown={event => event.stopPropagation()}>
        <button className="icon close" onClick={onClose} aria-label="Cerrar comparación">×</button>
        <small>COMPARAR PRECIOS</small>
        <h2 id="price-modal-title">{item.name}</h2>
        <form className="price-search" onSubmit={event => { event.preventDefault(); if (query.trim()) setSearch(query.trim()); }}>
          <input aria-label="Buscar producto" value={query} onChange={event => setQuery(event.target.value)} maxLength={80}/>
          <button type="submit" disabled={loading || !query.trim()}>Buscar</button>
        </form>
        {!supabaseReady && <p>Configura Supabase y despliega la función <code>compare-prices</code> para consultar precios.</p>}
        {loading && <p role="status">Consultando supermercados…</p>}
        {error && <p className="notice" role="alert">{error}</p>}
        <div className="price-stores">
          {(result?.stores || Object.keys(storeLinks).map(name => ({name, products: []}))).map(store => <div className="price-store" key={store.name}>
            <div className="price-store-heading"><h3>{store.name}</h3><a href={storeLinks[store.name](search)} target="_blank" rel="noopener noreferrer">Abrir tienda ↗</a></div>
            {store.error && <p className="price-error">Consulta no disponible: {store.error}</p>}
            {!store.error && result && !store.products.length && <p className="price-empty">Sin resultados.</p>}
            {store.products.map((product, index) => <a className="price-product" href={product.url} target="_blank" rel="noopener noreferrer" key={`${product.url}-${index}`}>
              <span>{product.name}</span><strong>{currency(product.price)}</strong>
              {product.unitPrice && product.unit && <small>{currency(product.unitPrice)} / {product.unit}</small>}
            </a>)}
          </div>)}
        </div>
        <p className="price-caveat">Los resultados pueden diferir en marca, tamaño o zona. Compara el mismo formato y verifica el precio en la tienda antes de comprar.</p>
      </section>
    </div>, document.body
  );
}
