// src/components/StatsIndicators.js
import StatsCard from './StatsCard.js';
import { getMonthlySummary } from '../statsService.js';
import { addValue } from '../utils/formatCurrency.js';
import { getSelectedMonth } from '../../../shared/MonthFilter.js';
import CURRENCIES from '../../../shared/config/monedas.js';

// Module-level refs so only one listener per event is active at a time.
// Each call to StatsIndicators() replaces the previous listeners with ones
// that render into the current (newly created) container node.
let _monthHandler = null;
let _dataChangedHandler = null;
const DATA_CHANGE_EVENTS = ['data-imported', 'ingreso:added', 'deuda:saved', 'deuda:updated', 'deuda:deleted'];
const NUMBER_FORMATTER = new Intl.NumberFormat('es-AR');

function asGlobalItems(byCurrency = {}) {
  return CURRENCIES.map((currency) => ({
    currency,
    value: NUMBER_FORMATTER.format(Number(byCurrency[currency] || 0))
  }));
}

function createGlobalSummary(summary) {
  const global = summary?.globalPending || {};
  const hasAnyUnpaid = Boolean(global.hasAnyUnpaid);

  const section = document.createElement('section');
  section.className = 'mt-4';
  section.innerHTML = `
    <div class="d-flex flex-column gap-1 mb-2">
      <h5 class="mb-0">Situación total</h5>
      <small class="text-muted">Incluye todos los meses cargados.</small>
      ${hasAnyUnpaid ? '' : '<small class="text-muted">Sin montos pendientes por pagar.</small>'}
    </div>
  `;

  const row = document.createElement('div');
  row.className = 'row row-cols-1 row-cols-md-3 g-3';

  const globalCards = [
    { title: 'Vencido', icon: 'bi-exclamation-triangle', color: 'danger', items: asGlobalItems(global.vencidoByCurrency) },
    { title: 'Pendiente futuro', icon: 'bi-calendar-check', color: 'warning', items: asGlobalItems(global.futuroByCurrency) },
    { title: 'Total por pagar', icon: 'bi-wallet2', color: 'primary', items: asGlobalItems(global.totalByCurrency) }
  ];

  for (const cardProps of globalCards) {
    const col = document.createElement('div');
    col.className = 'col';
    col.appendChild(StatsCard(cardProps));
    row.appendChild(col);
  }

  section.appendChild(row);
  return section;
}

export default function StatsIndicators({ mes, getSummary = getMonthlySummary, showGlobalSummary = false } = {}) {
  const container = document.createElement('div');
  container.className = 'mb-4';
  container.setAttribute('data-tour-step', 'indicadores');

  // Render helper
  async function render(periodo) {
    container.innerHTML = '';
    const loading = document.createElement('div');
    loading.className = 'col-12 text-body-secondary px-2';
    loading.textContent = 'Cargando resumen...';
    container.appendChild(loading);

    try {
      const summary = await getSummary(periodo, { includeGlobalPending: showGlobalSummary });
      container.innerHTML = '';

      const row = document.createElement('div');
      row.className = 'row row-cols-2 row-cols-lg-4 g-3';

      const cards = [
        { title: 'Ingresos',   icon: 'bi-cash-stack',     items: addValue(summary.byCurrency.ingresos),   color: 'success' },
        { title: 'Gastos',     icon: 'bi-wallet2',         items: addValue(summary.byCurrency.egresos),    color: 'danger' },
        { title: 'Balance',    icon: 'bi-briefcase',       items: addValue(summary.byCurrency.saldo),      color: 'primary' },
        { title: 'Pendientes', icon: 'bi-hourglass-split', items: addValue(summary.byCurrency.pendientes), color: 'warning' },
      ];

      for (const cardProps of cards) {
        const col = document.createElement('div');
        col.className = 'col';
        col.appendChild(StatsCard(cardProps));
        row.appendChild(col);
      }

      container.appendChild(row);
      if (showGlobalSummary) {
        container.appendChild(createGlobalSummary(summary));
      }
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
