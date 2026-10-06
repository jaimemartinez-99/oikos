import React, {useState} from 'react';
import {Plus, Trash2} from 'lucide-react';
import {BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line, Legend} from 'recharts';

const recurringTypes = new Set(['supermercado', 'agua', 'gas', 'luz', 'alquiler']);
const colors = ['#315d54', '#d7a866', '#df7d62', '#7770a8', '#91b9ad', '#be5b77', '#4e86a8'];
const today = () => new Date().toISOString().slice(0, 10);
const formatDate = value => value ? new Date(value + 'T12:00').toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'}).replaceAll('/', '-') : '';
const money = amount => Number(amount).toLocaleString('es-ES', {style: 'currency', currency: 'EUR'});

export default function Expenses({data, save}) {
  const [form, setForm] = useState({type: data.types[0] || '', detail: '', amount: '', date: today()});
  const [filters, setFilters] = useState({type: '', detail: '', min: '', max: '', from: '', to: ''});
  const [showAll, setShowAll] = useState(false);
  const [chartMode, setChartMode] = useState('pie');
  const [sort, setSort] = useState({key: 'date', dir: 'desc'});
  const [lineView, setLineView] = useState('month');
  const [lineMonth, setLineMonth] = useState('');
  const [selectedLineTypes, setSelectedLineTypes] = useState(null);

  const allTypes = [...new Set([...data.types, ...data.expenses.map(x => x.type)])].sort();
  const add = event => {
    event.preventDefault();
    const type = form.type.trim();
    if (!form.amount || !type) return;
    save(d => ({
      ...d,
      types: d.types.includes(type) ? d.types : [...d.types, type],
      expenses: [{...form, type, id: crypto.randomUUID(), amount: +form.amount, person: 'Vanesa'}, ...d.expenses],
    }));
    setForm({...form, detail: '', amount: ''});
  };

  const filtered = data.expenses.filter(x =>
    (showAll || recurringTypes.has(x.type.trim().toLocaleLowerCase('es-ES'))) &&
    (!filters.type || x.type.toLowerCase().includes(filters.type.toLowerCase())) &&
    (!filters.detail || x.detail.toLowerCase().includes(filters.detail.toLowerCase())) &&
    (!filters.min || Number(x.amount) >= Number(filters.min)) &&
    (!filters.max || Number(x.amount) <= Number(filters.max)) &&
    (!filters.from || x.date >= filters.from) &&
    (!filters.to || x.date <= filters.to)
  );
  const list = [...filtered].sort((a, b) => {
    const values = {date: [a.date, b.date], type: [a.type, b.type], detail: [a.detail, b.detail], amount: [Number(a.amount), Number(b.amount)]};
    const [one, two] = values[sort.key];
    const result = typeof one === 'number' ? one - two : String(one).localeCompare(String(two), 'es');
    return result * (sort.dir === 'asc' ? 1 : -1);
  });
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthTotal = filtered.filter(x => x.date.startsWith(currentMonth)).reduce((sum, x) => sum + Number(x.amount), 0);
  const total = filtered.reduce((sum, x) => sum + Number(x.amount), 0);
  const visibleTypes = [...new Set(filtered.map(x => x.type))].sort();
  const lineTypes = selectedLineTypes === null ? visibleTypes : visibleTypes.filter(type => selectedLineTypes.includes(type));
  const toggleLineType = type => setSelectedLineTypes(current => {
    const selected = current === null ? visibleTypes : current;
    return selected.includes(type) ? selected.filter(name => name !== type) : [...selected, type];
  });
  const totals = visibleTypes.map(name => ({name, total: filtered.filter(x => x.type === name).reduce((sum, x) => sum + Number(x.amount), 0)}));
  const months = [...new Set(filtered.map(x => x.date.slice(0, 7)))].sort();
  const activeMonth = lineMonth || months[months.length - 1] || today().slice(0, 7);
  const buckets = lineView === 'month' ? months : [...new Set(filtered.filter(x => x.date.startsWith(activeMonth)).map(x => x.date))].sort();
  const temporal = buckets.map(bucket => {
    const isMonth = lineView === 'month';
    const source = filtered.filter(x => isMonth ? x.date.startsWith(bucket) : x.date === bucket);
    return Object.fromEntries([
      ['period', isMonth ? new Date(bucket + '-01T12:00').toLocaleDateString('es-ES', {month: 'short', year: '2-digit'}) : formatDate(bucket)],
      ...visibleTypes.map(name => [name, source.filter(x => x.type === name).reduce((sum, x) => sum + Number(x.amount), 0)]),
    ]);
  });
  const setFilter = (key, value) => setFilters(current => ({...current, [key]: value}));
  const toggleSort = key => setSort(current => ({key, dir: current.key === key && current.dir === 'asc' ? 'desc' : 'asc'}));
  const sortLabel = key => sort.key === key ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : '';

  return <section>
    <div className="page-title"><div><h1>Gastos</h1><p>Controla el presupuesto compartido.</p></div></div>
    <div className="card expense-table">
      <div className="table-head expense-table-head">
        <div><h2>{showAll ? 'Todos los movimientos' : 'Gastos recurrentes'}</h2><small className="field-hint">{showAll ? 'Todos los tipos de gasto' : 'Supermercado, Agua, Gas, Luz y Alquiler'}</small></div>
        <div className="expense-table-actions">
          <div className="expense-totals">
            <strong>{money(monthTotal)} este mes</strong>
            <small>{money(total)} en total</small>
          </div>
          <label className="expense-switch"><input type="checkbox" role="switch" checked={showAll} onChange={event => setShowAll(event.target.checked)}/><span className="expense-switch-track" aria-hidden="true"/><span>Todos los gastos</span></label>
        </div>
      </div>
      <div className="expense-filters">
        <input list="expense-types" aria-label="Filtrar tipo" placeholder="Filtrar tipo" value={filters.type} onChange={event => setFilter('type', event.target.value)}/>
        <input aria-label="Buscar detalle" placeholder="Buscar detalle" value={filters.detail} onChange={event => setFilter('detail', event.target.value)}/>
        <input type="number" min="0" aria-label="Gasto mínimo" placeholder="Gasto mín." value={filters.min} onChange={event => setFilter('min', event.target.value)}/>
        <input type="number" min="0" aria-label="Gasto máximo" placeholder="Gasto máx." value={filters.max} onChange={event => setFilter('max', event.target.value)}/>
        <label>Desde<input type="date" value={filters.from} onChange={event => setFilter('from', event.target.value)}/></label>
        <label>Hasta<input type="date" value={filters.to} onChange={event => setFilter('to', event.target.value)}/></label>
      </div>
      <div className="table-scroll"><table><thead><tr>
        {[["date", "Fecha"], ["type", "Tipo"], ["detail", "Detalle"], ["amount", "Importe"]].map(([key, label]) => <th key={key}><button className="sort-header" onClick={() => toggleSort(key)}>{label}{sortLabel(key)}</button></th>)}
        <th aria-label="Acciones"/>
      </tr></thead><tbody>
        {list.map(x => <tr key={x.id}><td>{formatDate(x.date)}</td><td><span className="type-pill">{x.type}</span></td><td>{x.detail}</td><td>{money(x.amount)}</td><td><button className="icon danger" title="Borrar gasto" aria-label={`Borrar gasto de ${x.type}`} onClick={() => save(d => ({...d, expenses: d.expenses.filter(expense => expense.id !== x.id)}))}><Trash2 size={15}/></button></td></tr>)}
        {!list.length && <tr><td colSpan="5" className="empty-cell">No hay gastos que coincidan con los filtros.</td></tr>}
      </tbody></table></div>
    </div>
    <div className="expense-details">
      <form className="card form" onSubmit={add}>
        <h2>Registrar gasto</h2>
        <label>Tipo<input list="expense-types" required placeholder="Escribe o elige un tipo" value={form.type} onChange={event => setForm({...form, type: event.target.value})}/></label>
        <datalist id="expense-types">{allTypes.map(type => <option key={type} value={type}/>)}</datalist>
        <label>Detalle<input required value={form.detail} onChange={event => setForm({...form, detail: event.target.value})}/></label>
        <label>Importe (€)<input type="number" min="0" step="0.01" required value={form.amount} onChange={event => setForm({...form, amount: event.target.value})}/></label>
        <label>Fecha <small className="field-hint">Formato: día-mes-año</small><input type="date" value={form.date} onChange={event => setForm({...form, date: event.target.value})}/></label>
        <button><Plus/>Añadir gasto</button>
      </form>
      <div className="card chart expense-chart">
        <div className="table-head"><div><h2>{chartMode === 'line' ? 'Evolución temporal por tipo' : 'Gasto por tipo'}</h2><small className="field-hint">Los gráficos respetan la vista y los filtros.</small></div>
          <div className="chart-controls"><select className="chart-select" value={chartMode} onChange={event => setChartMode(event.target.value)}><option value="pie">Quesito</option><option value="bar">Barras</option><option value="line">Líneas temporales</option></select>
            {chartMode === 'line' && <><select value={lineView} onChange={event => setLineView(event.target.value)}><option value="month">Por mes</option><option value="day">Detalle diario</option></select>
              {lineView === 'day' && <select value={activeMonth} onChange={event => setLineMonth(event.target.value)}>{months.map(month => <option key={month} value={month}>{new Date(month + '-01T12:00').toLocaleDateString('es-ES', {month: 'long', year: 'numeric'})}</option>)}</select>}
            </>}
          </div>
        </div>
        {chartMode === 'line' && <fieldset className="line-type-picker"><legend>Tipos en las líneas</legend><div className="line-type-options">
          {visibleTypes.map(type => <label key={type}><input type="checkbox" checked={lineTypes.includes(type)} onChange={() => toggleLineType(type)}/>{type}</label>)}
          {selectedLineTypes !== null && <button type="button" className="line-select-all" onClick={() => setSelectedLineTypes(null)}>Mostrar todos</button>}
          {!visibleTypes.length && <small className="field-hint">No hay tipos con los filtros actuales.</small>}
        </div></fieldset>}
        <ResponsiveContainer width="100%" height={280}>
          {chartMode === 'pie' ? <PieChart><Pie data={totals} dataKey="total" nameKey="name" outerRadius={92} label>{totals.map((_, index) => <Cell key={index} fill={colors[index % colors.length]}/>)}</Pie><Tooltip/></PieChart>
            : chartMode === 'bar' ? <BarChart data={totals}><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="total">{totals.map((_, index) => <Cell key={index} fill={colors[index % colors.length]}/>)}</Bar></BarChart>
            : <LineChart data={temporal}><XAxis dataKey="period"/><YAxis/><Tooltip/><Legend/>{lineTypes.map(name => <Line key={name} type="monotone" dataKey={name} stroke={colors[visibleTypes.indexOf(name) % colors.length]} strokeWidth={2} connectNulls/>)}</LineChart>}
        </ResponsiveContainer>
      </div>
    </div>
  </section>;
}
