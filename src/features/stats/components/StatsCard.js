// src/components/StatsCard.js
// Utiliza clases Bootstrap para las tarjetas de estadísticas
import { KPI_CURRENCY } from '../../../shared/config/monedas.js';

export default function StatsCard({ title = '', icon = '', items = [], color = 'secondary', meta = '', size = 'default', emphasis = 'default' } = {}) {
  const isMuted = emphasis === 'muted';
  const isCompact = size === 'compact';

  const card = document.createElement('div');
  card.className = isMuted
    ? 'card h-100 rounded-4 border border-secondary-subtle bg-light'
    : `card h-100 rounded-4 shadow-sm border border-2 border-${color}`;

  const body = document.createElement('div');
  body.className = `card-body d-flex flex-column justify-content-between ${isCompact ? 'gap-1 p-2' : 'gap-2 p-3'}`;

  const titleEl = document.createElement('div');
  titleEl.className = `d-flex align-items-center gap-2 fw-semibold text-uppercase small ${isMuted ? 'text-secondary' : `text-${color}`}`;
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
    const arsEl = document.createElement('h6');
    arsEl.className = `d-flex align-items-center gap-2 text-nowrap fw-bold ${isMuted ? 'text-body' : `text-${color}`} lh-sm mb-0`;
    const arsBadge = document.createElement('span');
    arsBadge.className = isMuted ? 'badge small text-bg-light border text-secondary' : `badge small bg-${color}`;
    arsBadge.textContent = mainItem.currency;
    arsEl.appendChild(document.createTextNode(mainItem.value));
    arsEl.appendChild(arsBadge);
    valuesEl.appendChild(arsEl);
  }

  body.appendChild(valuesEl);

  if (meta) {
    const metaEl = document.createElement('div');
    metaEl.className = 'small text-body-secondary lh-sm';
    metaEl.textContent = meta;
    body.appendChild(metaEl);
  }

  card.appendChild(body);

  return card;
}
