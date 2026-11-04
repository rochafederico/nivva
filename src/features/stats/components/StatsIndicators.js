// src/features/stats/components/StatsIndicators.js
// Resumen del mes en un banner compacto (una sola tarjeta, ~120px):
// Ingresos, Egresos, Balance y "Por pagar este mes". Cada dato lleva a la lista que lo detalla.
import { getMonthlySummary } from '../statsService.js';
import { kpiCell } from './kpiCell.js';
import { formatMoneda, KPI_CURRENCY } from '../../../shared/config/monedas.js';
import { getSelectedMonth } from '../../../shared/MonthFilter.js';

// Module-level refs so only one listener per event is active at a time.
// Each call to StatsIndicators() replaces the previous listeners with ones
// that render into the current (newly created) container node.
let _monthHandler = null;
let _dataChangedHandler = null;
const DATA_CHANGE_EVENTS = ['data-imported', 'ingreso:added', 'deuda:saved', 'deuda:updated', 'deuda:deleted', 'monto:updated', 'gasto:saved', 'gasto:updated', 'gasto:deleted'];

// Destino de cada dato al tocarlo: el filtro de Inicio que lo detalla (Balance no tiene listado propio).
export const DEFAULT_KPI_LINKS = {
  ingresos: '/?vista=ingresos',
  egresos: '/?vista=egresos',
  pendientes: '/?vista=egresos&estado=pendiente',
};

// Orden y textos del banner. "Por pagar este mes" (antes "Pendientes") deja claro que es del mes,
// no el saldo total de deuda (eso lo muestra la Deuda total acumulada).
export const KPI_ITEMS = [
  { key: 'ingresos', label: 'Ingresos', icon: 'bi-arrow-down-circle', color: 'success', source: 'ingresos' },
  { key: 'egresos', label: 'Egresos', icon: 'bi-arrow-up-circle', color: 'danger', source: 'egresos' },
  { key: 'balance', label: 'Balance', icon: 'bi-briefcase', color: 'primary', source: 'saldo' },
  { key: 'pendientes', label: 'Por pagar este mes', icon: 'bi-hourglass-split', color: 'warning', source: 'pendientes' },
];

const plural = (n, singular, pluralForm) => `${n} ${n === 1 ? singular : pluralForm}`;

function navigate(href) {
  const current = window.location.pathname + window.location.search;
  if (href !== current) {
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

export default function StatsIndicators({ mes, links = DEFAULT_KPI_LINKS } = {}) {
  const container = document.createElement('div');
  container.setAttribute('data-tour-step', 'indicadores');
  // Navegación SPA al tocar un dato
  container.addEventListener('click', (e) => {
    const link = e.target.closest('a.stretched-link');
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(link.getAttribute('href'));
  });

  // Render helper
  async function render(periodo) {
    container.innerHTML = '';
    const loading = document.createElement('div');
    loading.className = 'text-body-secondary px-2';
    loading.textContent = 'Cargando resumen...';
    container.appendChild(loading);

    try {
      const summary = await getMonthlySummary(periodo);
      container.innerHTML = '';

      const card = document.createElement('div');
      card.className = 'card kpi-banner rounded-4 shadow-sm';
      const body = document.createElement('div');
      body.className = 'card-body kpi-body px-3 py-2';
      const row = document.createElement('div');
      row.className = 'row row-cols-2 row-cols-md-4 g-2 g-md-3';

      const vencidos = summary.counts?.vencidos || 0;
      for (const item of KPI_ITEMS) {
        const value = Number(summary.byCurrency[item.source]?.[KPI_CURRENCY]) || 0;
        const alert = item.key === 'pendientes' && vencidos ? plural(vencidos, 'vencido', 'vencidos') : '';
        row.appendChild(kpiCell(item, formatMoneda(value, KPI_CURRENCY), links[item.key], alert));
      }

      body.appendChild(row);
      card.appendChild(body);
      container.appendChild(card);
    } catch (err) {
      container.innerHTML = '';
      const errEl = document.createElement('div');
      errEl.className = 'text-danger px-2';
      errEl.textContent = 'No pudimos cargar el resumen. Actualizá la página.';
      container.appendChild(errEl);
      console.error('Error getMonthlySummary', err);
    }
  }

  const initialPeriodo = mes || getSelectedMonth();
  render(initialPeriodo);

  // Remove the previous listener (if any) so navigating away and back does
  // not leave stale handlers that render into detached nodes.
  if (_monthHandler) {
    window.removeEventListener('ui:month', _monthHandler);
  }
  _monthHandler = (e) => {
    if (!container.isConnected) return;
    const nuevo = (e && e.detail && e.detail.mes) ? e.detail.mes : getSelectedMonth();
    render(nuevo);
  };
  window.addEventListener('ui:month', _monthHandler);

  if (_dataChangedHandler) {
    DATA_CHANGE_EVENTS.forEach(eventName => window.removeEventListener(eventName, _dataChangedHandler));
  }
  _dataChangedHandler = () => {
    if (!container.isConnected) return;
    render(getSelectedMonth());
  };
  DATA_CHANGE_EVENTS.forEach(eventName => window.addEventListener(eventName, _dataChangedHandler));

  return container;
}
