// src/components/StatsCard.js
// Utiliza clases Bootstrap para las tarjetas de estadísticas
import { KPI_CURRENCY } from '../../../shared/config/monedas.js';

// El amarillo de Bootstrap no alcanza contraste AA sobre blanco: se usa su variante "emphasis".
function textClass(color) {
  return color === 'warning' ? 'text-warning-emphasis' : `text-${color}`;
}

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.icon] - clase Bootstrap Icon
 * @param {{currency: string, value: string}[]} [props.items]
 * @param {string} [props.color] - color Bootstrap (success, danger, primary, warning…)
 * @param {{text: string, icon?: string, className?: string}|null} [props.detail] - línea de detalle bajo el monto
 * @param {string} [props.href] - si viene, toda la tarjeta es un link (stretched-link en el título)
 */
export default function StatsCard({ title = '', icon = '', items = [], color = 'secondary', detail = null, href = '' } = {}) {
  const card = document.createElement('div');
  card.className = `card h-100 rounded-4 shadow-sm border border-2 border-${color}`;
  if (href) card.classList.add('kpi-card-link', 'position-relative');

  const body = document.createElement('div');
  // kpi-body es un container query: el monto achica su fuente si la tarjeta es angosta
  body.className = 'card-body kpi-body d-flex flex-column gap-2 p-3';

  const titleEl = document.createElement('div');
  titleEl.className = `d-flex align-items-center gap-2 fw-semibold text-uppercase small ${textClass(color)}`;
  if (icon) {
    const iconEl = document.createElement('i');
    iconEl.className = `bi ${icon}`;
    iconEl.setAttribute('aria-hidden', 'true');
    titleEl.appendChild(iconEl);
  }
  if (href) {
    const link = document.createElement('a');
    link.href = href;
    link.className = 'stretched-link text-reset text-decoration-none';
    link.textContent = title;
    titleEl.appendChild(link);
  } else {
    titleEl.appendChild(document.createTextNode(title));
  }
  body.appendChild(titleEl);

  const valuesEl = document.createElement('div');

  if (items.length > 0) {
    const mainItem = items.find(i => i.currency === KPI_CURRENCY) || items[0];
    // Monto y moneda pueden pasar a dos renglones en pantallas angostas; el monto nunca se corta.
    const arsEl = document.createElement('h6');
    arsEl.className = `d-flex flex-wrap align-items-center column-gap-2 row-gap-1 fw-bold ${textClass(color)} lh-sm mb-1`;
    const amountEl = document.createElement('span');
    amountEl.className = 'kpi-amount text-nowrap';
    amountEl.textContent = mainItem.value;
    const arsBadge = document.createElement('span');
    arsBadge.className = `badge small text-bg-${color}`;
    arsBadge.textContent = mainItem.currency;
    arsEl.appendChild(amountEl);
    arsEl.appendChild(arsBadge);
    valuesEl.appendChild(arsEl);
  }

  if (detail && detail.text) {
    const detailEl = document.createElement('div');
    detailEl.className = `kpi-detail small ${detail.className || 'text-body-secondary'}`;
    if (detail.icon) {
      const detailIcon = document.createElement('i');
      detailIcon.className = `bi ${detail.icon} me-1`;
      detailIcon.setAttribute('aria-hidden', 'true');
      detailEl.appendChild(detailIcon);
    }
    detailEl.appendChild(document.createTextNode(detail.text));
    valuesEl.appendChild(detailEl);
  }

  body.appendChild(valuesEl);
  card.appendChild(body);

  return card;
}
