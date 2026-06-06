// src/components/StatsIndicators.js
import StatsCard from './StatsCard.js';
import { getMonthlySummary, getGlobalPaymentSummary } from '../statsService.js';
import { addValue } from '../utils/formatCurrency.js';
import { getSelectedMonth } from '../../../shared/MonthFilter.js';

// Module-level refs so only one listener per event is active at a time.
// Each call to StatsIndicators() replaces the previous listeners with ones
// that render into the current (newly created) container node.
let _monthHandler = null;
let _dataChangedHandler = null;
const DATA_CHANGE_EVENTS = ['data-imported', 'ingreso:added', 'deuda:saved', 'deuda:updated', 'deuda:deleted'];

function countLabel(count, singular, plural) {
  const safeCount = Number(count) || 0;
  return `${safeCount} ${safeCount === 1 ? singular : plural}`;
}

function renderGlobalSummary(summary) {
  const section = document.createElement('section');
  section.className = 'card border-0 bg-body-tertiary rounded-4 shadow-sm mt-2';
  section.setAttribute('aria-labelledby', 'global-summary-title');

  const body = document.createElement('div');
  body.className = 'card-body p-2 p-sm-3';

  const header = document.createElement('div');
  header.className = 'd-flex align-items-start justify-content-between gap-2 mb-2';

  const titleWrapper = document.createElement('div');

  const title = document.createElement('h2');
  title.id = 'global-summary-title';
  title.className = 'h6 fw-bold mb-0';
  title.textContent = 'Situación total';
  titleWrapper.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'small text-body-secondary mb-0';
  subtitle.textContent = 'Resumen global de todos los períodos';
  titleWrapper.appendChild(subtitle);
  header.appendChild(titleWrapper);

  const icon = document.createElement('i');
  icon.className = 'bi bi-layers text-secondary small';
  icon.setAttribute('aria-hidden', 'true');
  header.appendChild(icon);
  body.appendChild(header);

  const row = document.createElement('div');
  row.className = 'row g-2 align-items-stretch';

  const cards = [
    {
      colClass: 'col-6 col-md-4',
      props: {
        title: 'Vencido',
        icon: 'bi-exclamation-triangle',
        items: addValue(summary.byCurrency.overdue),
        color: 'danger',
        meta: countLabel(summary.counts.overdue, 'vencido', 'vencidos'),
        size: 'compact'
      }
    },
    {
      colClass: 'col-6 col-md-4',
      props: {
        title: 'Próximos a pagar',
        icon: 'bi-calendar-event',
        items: addValue(summary.byCurrency.upcoming),
        color: 'warning',
        meta: countLabel(summary.counts.upcoming, 'próximo', 'próximos'),
        size: 'compact'
      }
    },
    {
      colClass: 'col-12 col-md-4',
      props: {
        title: 'Total por pagar',
        icon: 'bi-receipt',
        items: addValue(summary.byCurrency.totalDue),
        color: 'secondary',
        meta: countLabel(summary.counts.totalDue, 'pago pendiente', 'pagos pendientes'),
        size: 'compact',
        emphasis: 'muted'
      }
    }
  ];

  for (const card of cards) {
    const col = document.createElement('div');
    col.className = card.colClass;
    col.appendChild(StatsCard(card.props));
    row.appendChild(col);
  }

  body.appendChild(row);
  section.appendChild(body);
  return section;
}

export default function StatsIndicators({ mes, showGlobalSummary = false } = {}) {
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
      const summary = await getMonthlySummary(periodo);
      const globalSummary = showGlobalSummary ? await getGlobalPaymentSummary() : null;
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

      if (globalSummary) {
        container.appendChild(renderGlobalSummary(globalSummary));
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
