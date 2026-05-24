// src/features/deudas/components/DebtRowItem.js
// Clase JS que construye una fila <tr> de deuda con diseño consistente en todos los breakpoints.
// 2 celdas: info (avatar + nombre + tipo + fecha) y acciones (monto + badge + toggle + chevron).

import '../../../shared/components/AppCheckbox.js';
import { formatMoneda } from '../../../shared/config/monedas.js';

// ── Helpers exportados (usados también en tests) ──────────────────────────────

export function getInitials(name) {
    const parts = (name || '').trim().split(/\s+/).filter(p => p.length > 0);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return '';
}

export function getAvatarClasses(name) {
    const palettes = [
        'bg-danger-subtle text-danger-emphasis',
        'bg-warning-subtle text-warning-emphasis',
        'bg-success-subtle text-success-emphasis',
        'bg-primary-subtle text-primary-emphasis',
        'bg-info-subtle text-info-emphasis',
        'bg-secondary-subtle text-secondary-emphasis',
        'bg-dark-subtle text-dark-emphasis',
    ];
    return palettes[(name?.charCodeAt(0) || 0) % palettes.length];
}

export function formatDate(isoDate) {
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(String(isoDate))) return String(isoDate || '');
    const [y, m, d] = String(isoDate).split('-');
    return `${d}/${m}/${y}`;
}

export function getTipoIcon(tipo) {
    const t = (tipo || '').toLowerCase();
    if (t.includes('alquiler')) return 'bi-house';
    if (t.includes('préstamo') || t.includes('prestamo')) return 'bi-bank2';
    if (t.includes('tarjeta')) return 'bi-credit-card';
    if (t.includes('servicio')) return 'bi-tools';
    return 'bi-tag';
}

export function getEstado(row) {
    if (row?.pagado) return { label: 'Pagado', className: 'text-bg-success' };
    const v = String(row?.vencimiento ?? '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (v < today) return { label: 'Vencido', className: 'text-bg-danger' };
    if (v === today) return { label: 'Vence hoy', className: 'text-bg-warning' };
    return { label: 'Pendiente', className: 'text-bg-secondary' };
}

// ── Componente ────────────────────────────────────────────────────────────────
// DebtRowItem es una clase JS (no un custom element) que construye un <tr> directamente,
// eliminando el elemento envoltorio extra en el DOM.
// Uso: const item = new DebtRowItem(row, { excludeColumns, showDetailAction });
//       tbody.appendChild(item.element);

export class DebtRowItem {
    constructor(row, options = {}) {
        this._rowData = row;
        this._excludeColumns = options.excludeColumns || [];
        this._showDetailAction = !!options.showDetailAction;
        this.element = this._build();
    }

    _build() {
        const row = this._rowData;
        if (!row) return document.createElement('tr');
        const excl = this._excludeColumns;

        // ── Estado badge (compartido) ──────────────────────────────────
        const badgeSpan = document.createElement('span');

        const renderEstado = () => {
            badgeSpan.innerHTML = '';
            const estado = getEstado(row);
            if (!estado) return;
            const b = document.createElement('span');
            b.className = `badge ${estado.className} text-nowrap`;
            b.textContent = estado.label;
            badgeSpan.appendChild(b);
        };

        // Exponer callbacks para sincronización externa
        row._renderEstadoPago = () => renderEstado();
        row._renderEstadoPagoCard = () => renderEstado();

        renderEstado();

        // ── Checkbox ─────────────────────────────────────────────────
        const cb = document.createElement('app-checkbox');
        cb.inputId = `debt-m-${row.id ?? Math.random().toString(36).slice(2)}`;
        cb.checked = !!row.pagado;
        cb.title = 'Marcar como pagado';

        const handleToggle = async (e) => {
            const nextChecked = !!e.detail.checked;
            const previousChecked = !!row.pagado;
            row.pagado = nextChecked;
            cb.checked = nextChecked;
            renderEstado();
            try {
                const { setPagado } = await import('../../montos/montoRepository.js');
                await setPagado(row.id, nextChecked);
                window.dispatchEvent(new CustomEvent('app:notify', {
                    detail: {
                        message: nextChecked
                            ? '✅ Cuota marcada como pagada.'
                            : '⚠️ Cuota marcada como pendiente.',
                        type: nextChecked ? 'success' : 'warning'
                    }
                }));
                if (typeof row._reload === 'function') row._reload();
            } catch {
                row.pagado = previousChecked;
                cb.checked = previousChecked;
                renderEstado();
                window.dispatchEvent(new CustomEvent('app:notify', {
                    detail: {
                        message: '❌ No pudimos actualizar el estado de pago. Intentá de nuevo.',
                        type: 'danger'
                    }
                }));
            }
        };

        cb.addEventListener('checkbox-change', handleToggle);

        // ── Fila principal ────────────────────────────────────────────
        const tr = document.createElement('tr');
        if (typeof row._onRowClick === 'function') {
            tr.classList.add('cursor-pointer');
            tr.addEventListener('click', () => row._onRowClick(row, tr));
        }

        // ── COL 1: info (avatar + nombre + tipo + fecha) ─────────────
        const tdInfo = document.createElement('td');
        tdInfo.className = 'd-table-cell py-3';

        const infoFlex = document.createElement('div');
        infoFlex.className = 'd-flex align-items-center gap-3';

        const avatar = document.createElement('div');
        avatar.className = `debt-card-avatar d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 fw-semibold ${getAvatarClasses(row.acreedor)}`;
        avatar.textContent = getInitials(row.acreedor);
        infoFlex.appendChild(avatar);

        const nameBlock = document.createElement('div');
        nameBlock.className = 'flex-grow-1 min-w-0';

        const nameEl = document.createElement('h6');
        nameEl.className = 'fw-semibold text-truncate mb-0';
        nameEl.textContent = row.acreedor ?? '';
        nameBlock.appendChild(nameEl);

        const tipo = String(row.tipoDeuda ?? '').trim();
        if (tipo && !excl.includes('tipoDeuda')) {
            const tipoBadge = document.createElement('span');
            tipoBadge.className = 'badge rounded-pill bg-light text-secondary border fw-normal mt-1 d-inline-block';
            const tipoIcon = document.createElement('i');
            tipoIcon.className = `bi ${getTipoIcon(tipo)} me-1`;
            tipoIcon.setAttribute('aria-hidden', 'true');
            tipoBadge.appendChild(tipoIcon);
            tipoBadge.appendChild(document.createTextNode(tipo));
            nameBlock.appendChild(tipoBadge);
        }

        const venc = String(row.vencimiento ?? '').trim();

        // Helper para construir el elemento de fecha (siempre visible, sin clases responsive)
        const makeDateEl = () => {
            const el = document.createElement('small');
            el.className = 'd-flex align-items-center text-muted mt-1';
            const icon = document.createElement('i');
            icon.className = 'bi bi-calendar3 me-1';
            icon.setAttribute('aria-hidden', 'true');
            el.appendChild(icon);
            el.appendChild(document.createTextNode(formatDate(venc)));
            return el;
        };

        if (venc) {
            nameBlock.appendChild(makeDateEl());
        }

        infoFlex.appendChild(nameBlock);
        tdInfo.appendChild(infoFlex);
        tr.appendChild(tdInfo);

        // ── COL 2: estado + switch + chevron ─────────────────────────
        const tdActions = document.createElement('td');
        tdActions.className = 'd-table-cell py-3 pe-1 align-middle';

        const actWrap = document.createElement('div');
        actWrap.className = 'd-flex align-items-center';

        // Estado: monto + badge en línea, alineados a la derecha
        const estadoCol = document.createElement('div');
        estadoCol.className = 'd-flex align-items-center flex-grow-1 justify-content-end me-2';

        // Monto y badge en la misma línea
        const amountRow = document.createElement('div');
        amountRow.className = 'd-flex align-items-center gap-1';

        const amountEl = document.createElement('span');
        amountEl.className = 'fw-semibold text-nowrap';
        amountEl.textContent = formatMoneda(row.monto, row.moneda);
        amountRow.appendChild(amountEl);
        amountRow.appendChild(badgeSpan);
        estadoCol.appendChild(amountRow);

        actWrap.appendChild(estadoCol);

        // Switch: columna de ancho fijo, centrada, independiente del estado
        const switchCol = document.createElement('div');
        switchCol.className = 'd-flex align-items-center justify-content-center flex-shrink-0';
        switchCol.style.cssText = 'width:44px;min-width:44px';
        switchCol.addEventListener('click', e => e.stopPropagation());
        switchCol.appendChild(cb);
        actWrap.appendChild(switchCol);

        // Chevron: columna de ancho fijo, siempre pegada al borde derecho
        if (typeof row._onRowClick === 'function') {
            const chevronBtn = document.createElement('button');
            chevronBtn.type = 'button';
            chevronBtn.className = 'btn btn-link p-0 text-muted d-flex align-items-center justify-content-center flex-shrink-0';
            chevronBtn.style.cssText = 'width:20px;min-width:20px';
            chevronBtn.setAttribute('aria-label', `Ver detalle de ${row.acreedor || 'esta deuda'}`);
            chevronBtn.addEventListener('click', e => {
                e.stopPropagation();
                row._onRowClick(row, chevronBtn);
            });
            const chevron = document.createElement('i');
            chevron.className = 'bi bi-chevron-right';
            chevron.setAttribute('aria-hidden', 'true');
            chevronBtn.appendChild(chevron);
            actWrap.appendChild(chevronBtn);
        }

        tdActions.appendChild(actWrap);
        tr.appendChild(tdActions);

        return tr;
    }
}
