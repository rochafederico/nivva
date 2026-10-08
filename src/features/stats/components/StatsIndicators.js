// src/components/StatsIndicators.js
import StatsCard from './StatsCard.js';
import { getMonthlySummary } from '../statsService.js';
import { addValue } from '../utils/formatCurrency.js';
import { getSelectedMonth } from '../../../shared/MonthFilter.js';

// Module-level refs so only one listener per event is active at a time.
// Each call to StatsIndicators() replaces the previous listeners with ones
// that render into the current (newly created) container node.
let _monthHandler = null;
let _dataChangedHandler = null;
const DATA_CHANGE_EVENTS = ['data-imported', 'ingreso:added', 'deuda:saved', 'deuda:updated', 'deuda:deleted'];

// Destino de cada tarjeta al tocarla (Balance no tiene listado propio).
export const DEFAULT_KPI_LINKS = { ingresos: '/ingresos', egresos: '/gastos', pendientes: '/gastos' };

const plural = (n, singular, pluralForm) => `${n} ${n === 1 ? singular : pluralForm}`;

/** Textos de detalle de cada tarjeta a partir de las cantidades del mes. */
export function kpiDetails(counts = {}) {
  const { ingresos = 0, montos = 0, pagados = 0, pendientes = 0, vencidos = 0 } = counts;
  return {
    ingresos: { text: ingresos ? plural(ingresos, 'ingreso', 'ingresos') : 'Sin ingresos' },
    egresos: { text: montos ? `${pagados} de ${montos} pagados` : 'Sin egresos' },
    balance: { text: 'Ingresos menos egresos' },
    pendientes: vencidos
      ? { text: plural(vencidos, 'vencido', 'vencidos'), icon: 'bi-exclamation-triangle', className: 'text-danger-emphasis fw-semibold' }
      : { text: pendientes ? `${pendientes} por pagar` : 'Todo pagado' },
  };
}

function navigate(href) {
  const current = window.location.pathname + window.location.search;
  if (href !== current) {
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

export default function StatsIndicators({ mes, links = DEFAULT_KPI_LINKS } = {}) {
  const container = document.createElement('div');
  container.className = 'mb-4';
  container.setAttribute('data-tour-step', 'indicadores');
  // Navegación SPA al tocar una tarjeta
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
    loading.className = 'col-12 text-body-secondary px-2';
    loading.textContent = 'Cargando resumen...';
    container.appendChild(loading);

    try {
      const summary = await getMonthlySummary(periodo);
      container.innerHTML = '';

      const row = document.createElement('div');
      row.className = 'row row-cols-2 row-cols-lg-4 g-3';

      const details = kpiDetails(summary.counts);
      const cards = [
        { title: 'Ingresos',   icon: 'bi-cash-stack',     items: addValue(summary.byCurrency.ingresos),   color: 'success', detail: details.ingresos,   href: links.ingresos },
        { title: 'Egresos',    icon: 'bi-wallet2',         items: addValue(summary.byCurrency.egresos),    color: 'danger',  detail: details.egresos,    href: links.egresos },
        { title: 'Balance',    icon: 'bi-briefcase',       items: addValue(summary.byCurrency.saldo),      color: 'primary', detail: details.balance,    href: links.balance },
        { title: 'Pendientes', icon: 'bi-hourglass-split', items: addValue(summary.byCurrency.pendientes), color: 'warning', detail: details.pendientes, href: links.pendientes },
      ];

      for (const cardProps of cards) {
        const col = document.createElement('div');
        col.className = 'col';
        col.appendChild(StatsCard(cardProps));
        row.appendChild(col);
      }

      container.appendChild(row);
    } catch (err) {
      container.innerHTML = '';
      const errEl = document.createElement('div');
      errEl.className = 'col-12 text-danger px-2';
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
