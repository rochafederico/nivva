// src/shared/components/ListRow.js
// Fila <tr> con el diseño compartido por ingresos y egresos, igual en todos los breakpoints:
//   COL 1: avatar + título + fecha corta (+ detalle debajo, p. ej. el tipo)
//   COL 2: monto + estado y, como mucho, un control (switch de pagado)
// Si la fila tiene detalle, se abre tocando la fila o el título (un botón, accesible con teclado).

import { formatFechaCorta } from '../utils/fechas.js';

/**
 * @param {Object} opts
 * @param {{ text?: string, icon?: string, className?: string }|null} [opts.avatar] - iniciales o ícono Bootstrap
 * @param {string} opts.title - texto principal (acreedor, descripción)
 * @param {string} [opts.date] - fecha ISO YYYY-MM-DD; se muestra como "05 oct"
 * @param {Node|null} [opts.detail] - nodo opcional debajo del título
 * @param {string} opts.amount - monto ya formateado
 * @param {string} [opts.amountClassName] - clases extra para el monto (color)
 * @param {Node|null} [opts.status] - nodo junto al monto (badge de estado)
 * @param {Node[]} [opts.controls] - controles a la derecha; su click no abre el detalle
 * @param {((opener: HTMLElement) => void)|null} [opts.onOpen] - hace la fila clickeable y el título un botón
 * @param {string} [opts.openLabel] - nombre accesible del botón del título (debe incluir el título)
 * @returns {HTMLTableRowElement}
 */
export function createListRow({
    avatar = null,
    title = '',
    date = '',
    detail = null,
    amount = '',
    amountClassName = '',
    status = null,
    controls = [],
    onOpen = null,
    openLabel = 'Ver detalle',
} = {}) {
    const tr = document.createElement('tr');
    if (onOpen) {
        tr.classList.add('cursor-pointer');
        tr.addEventListener('click', () => onOpen(tr));
    }

    // ── COL 1: avatar + título + fecha ───────────────────────────
    const tdInfo = document.createElement('td');
    tdInfo.className = 'd-table-cell py-3';

    const infoFlex = document.createElement('div');
    infoFlex.className = 'd-flex align-items-center gap-3';

    if (avatar) {
        const avatarEl = document.createElement('div');
        avatarEl.className = `debt-card-avatar d-none d-sm-flex align-items-center justify-content-center rounded-circle flex-shrink-0 fw-semibold ${avatar.className || ''}`.trim();
        if (avatar.icon) {
            const icon = document.createElement('i');
            icon.className = `bi ${avatar.icon}`;
            icon.setAttribute('aria-hidden', 'true');
            avatarEl.appendChild(icon);
        } else {
            avatarEl.textContent = avatar.text || '';
        }
        infoFlex.appendChild(avatarEl);
    }

    const nameBlock = document.createElement('div');
    nameBlock.className = 'flex-grow-1 min-w-0';

    // Responsive: título + fecha en línea en desktop, apilados en mobile
    const nameDateRow = document.createElement('div');
    nameDateRow.className = 'd-flex flex-column flex-md-row align-items-md-baseline gap-md-2 min-w-0';

    const nameEl = document.createElement('h6');
    nameEl.className = 'fw-bold text-break mb-0';
    if (onOpen) {
        const titleBtn = document.createElement('button');
        titleBtn.type = 'button';
        titleBtn.className = 'list-row-title';
        titleBtn.setAttribute('aria-label', openLabel);
        titleBtn.textContent = title;
        titleBtn.addEventListener('click', e => {
            e.stopPropagation();
            onOpen(titleBtn);
        });
        nameEl.appendChild(titleBtn);
    } else {
        nameEl.textContent = title;
    }
    nameDateRow.appendChild(nameEl);

    const isoDate = String(date ?? '').trim();
    if (isoDate) {
        const dateEl = document.createElement('small');
        dateEl.className = 'text-muted text-nowrap mt-1 mt-md-0';
        dateEl.textContent = formatFechaCorta(isoDate);
        nameDateRow.appendChild(dateEl);
    }

    nameBlock.appendChild(nameDateRow);
    if (detail) nameBlock.appendChild(detail);

    infoFlex.appendChild(nameBlock);
    tdInfo.appendChild(infoFlex);
    tr.appendChild(tdInfo);

    // ── COL 2: monto + estado y control ──────────────────────────
    const tdActions = document.createElement('td');
    tdActions.className = 'd-table-cell py-3 pe-1 align-middle';

    const actWrap = document.createElement('div');
    actWrap.className = 'd-flex align-items-center';

    // Monto y estado alineados a la derecha; el estado puede pasar al renglón siguiente en mobile
    const estadoCol = document.createElement('div');
    const hasTrailing = controls.length > 0;
    estadoCol.className = `d-flex flex-grow-1 justify-content-end ${hasTrailing ? 'me-1 me-sm-4' : 'pe-2'}`;

    const amountRow = document.createElement('div');
    amountRow.className = 'd-flex flex-wrap align-items-baseline gap-1 justify-content-end';

    const amountEl = document.createElement('span');
    amountEl.className = `fw-normal lh-sm text-nowrap ${amountClassName}`.trim();
    amountEl.textContent = amount;
    amountRow.appendChild(amountEl);
    if (status) amountRow.appendChild(status);
    estadoCol.appendChild(amountRow);
    actWrap.appendChild(estadoCol);

    // Controles: columna flex-shrink-0 con padding para zona táctil adecuada
    controls.forEach(control => {
        const controlCol = document.createElement('div');
        controlCol.className = 'd-flex align-items-center justify-content-center flex-shrink-0 px-1 px-sm-2';
        controlCol.addEventListener('click', e => e.stopPropagation());
        controlCol.appendChild(control);
        actWrap.appendChild(controlCol);
    });

    tdActions.appendChild(actWrap);
    tr.appendChild(tdActions);

    return tr;
}
