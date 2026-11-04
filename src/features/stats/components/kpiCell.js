// El amarillo de Bootstrap no alcanza contraste AA sobre blanco: se usa su variante "emphasis".
function textClass(color) {
  return color === 'warning' ? 'text-warning-emphasis' : `text-${color}`;
}

/** Un dato del banner: etiqueta (link si hay destino) y monto en la moneda principal. */
export function kpiCell({ label, icon, color }, amount, href, alert) {
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
