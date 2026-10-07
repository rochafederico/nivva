// src/features/stats/components/StatsIndicators.js
// Resumen del mes en un banner compacto (una sola tarjeta, ~120px):
// Ingresos, Egresos, Balance y "Por pagar este mes". Cada dato lleva a la lista que lo detalla.
import { getMonthlySummary } from '../statsService.js';
import { formatMoneda, KPI_CURRENCY } from '../../../shared/config/monedas.js';
import { getSelectedMonth } from '../../../shared/MonthFilter.js';

// Module-level refs so only one listener per event is active at a time.
// Each call to StatsIndicators() replaces the previous listeners with ones
// that render into the current (newly created) container node.
let _monthHandler = null;
let _dataChangedHandler = null;
const DATA_CHANGE_EVENTS = ['data-imported', 'ingreso:added', 'deuda:saved', 'deuda:updated', 'deuda:deleted', 'monto:updated'];

// Destino de cada dato al tocarlo (Balance no tiene listado propio).
export const DEFAULT_KPI_LINKS = { ingresos: '/ingresos', egresos: '/gastos', pendientes: '/gastos' };

// Orden y textos del banner. "Por pagar este mes" (antes "Pendientes") deja claro que es del mes,
// no el saldo total de deuda (eso lo muestra la Deuda total acumulada).
export const KPI_ITEMS = [
  { key: 'ingresos', label: 'Ingresos', icon: 'bi-arrow-down-circle', color: 'success', source: 'ingresos' },
  { key: 'egresos', label: 'Egresos', icon: 'bi-arrow-up-circle', color: 'danger', source: 'egresos' },
  { key: 'balance', label: 'Balance', icon: 'bi-briefcase', color: 'primary', source: 'saldo' },
  { key: 'pendientes', label: 'Por pagar este mes', icon: 'bi-hourglass-split', color: 'warning', source: 'pendientes' },
];

// El amarillo de Bootstrap no alcanza contraste AA sobre blanco: se usa su variante "emphasis".
function textClass(color) {
  return color === 'warning' ? 'text-warning-emphasis' : `text-${color}`;
}

const plural = (n, singular, pluralForm) => `${n} ${n === 1 ? singular : pluralForm}`;

function navigate(href) {
  const current = window.location.pathname + window.location.search;
  if (href !== current) {
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

/** Un dato del banner: etiqueta (link si hay destino) y monto en la moneda principal. */
function kpiCell({ label, icon, color }, amount, href, alert) {
  const col = document.createElement('div');
  col.className = 'col';

  const cell = document.createElement('div');
  cell.className = 'kpi-cell position-relative h-100';

  const labelEl = document.createElement('div');
  labelEl.className = `kpi-label small fw-semibold text-truncate ${textClass(color)}`;
  const iconEl = document.createElement('i');
  iconEl.className = `bi ${icon} me-1`;
  iconEl.setAttribute('aria-hidden', 'true');
  labelEl.appendChild(iconEl);
  if (href) {
    const link = document.createElement('a');
    link.href = href;
    link.className = 'stretched-link text-reset text-decoration-none';
    link.textContent = label;
    labelEl.appendChild(link);
  } else {
    labelEl.appendChild(document.createTextNode(label));
  }
  cell.appendChild(labelEl);

  const valueRow = document.createElement('div');
  valueRow.className = 'd-flex flex-wrap align-items-center column-gap-1';
  const amountEl = document.createElement('span');
  amountEl.className = `kpi-amount fw-bold text-nowrap ${textClass(color)}`;
  amountEl.textContent = amount;
  valueRow.appendChild(amountEl);
  if (alert) {
    // En mobile solo el ícono (no agranda el banner); desde md, el texto completo
    const alertEl = document.createElement('span');
    alertEl.className = 'kpi-alert badge text-bg-danger';
    alertEl.title = alert;
    alertEl.innerHTML = `<i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i><span class="d-none d-md-inline ms-1">${alert}</span><span class="visually-hidden d-md-none">${alert}</span>`;
    valueRow.appendChild(alertEl);
  }
  cell.appendChild(valueRow);

  col.appendChild(cell);
  return col;
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
