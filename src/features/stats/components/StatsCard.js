// src/components/StatsCard.js
// Utiliza clases Bootstrap para las tarjetas de estadísticas
import { KPI_CURRENCY } from '../../../shared/config/monedas.js';

// El amarillo de Bootstrap no alcanza contraste AA sobre blanco: se usa su variante "emphasis".
function textClass(color) {
  return color === 'warning' ? 'text-warning-emphasis' : `text-${color}`;
}

export default function StatsCard({ title = '', icon = '', items = [], color = 'secondary' } = {}) {
  const card = document.createElement('div');
  card.className = `card h-100 rounded-4 shadow-sm border border-2 border-${color}`;

  const body = document.createElement('div');
  // kpi-body es un container query: el monto achica su fuente si la tarjeta es angosta
  body.className = 'card-body kpi-body d-flex flex-column justify-content-between gap-2 p-3';

  const titleEl = document.createElement('div');
  titleEl.className = `d-flex align-items-center gap-2 fw-semibold text-uppercase small ${textClass(color)}`;
  if (icon) {
    const iconEl = document.createElement('i');
    iconEl.className = `bi ${icon}`;
    iconEl.setAttribute('aria-hidden', 'true');
    titleEl.appendChild(iconEl);
  }
  titleEl.appendChild(document.createTextNode(title));
  body.appendChild(titleEl);

  const valuesEl = document.createElement('div');

  if (items.length > 0) {
    const mainItem = items.find(i => i.currency === KPI_CURRENCY) || items[0];
    // Monto y moneda pueden pasar a dos renglones en pantallas angostas; el monto nunca se corta.
    const arsEl = document.createElement('h6');
    arsEl.className = `d-flex flex-wrap align-items-center column-gap-2 row-gap-1 fw-bold ${textClass(color)} lh-sm mb-0`;
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

  body.appendChild(valuesEl);
  card.appendChild(body);

  return card;
}
