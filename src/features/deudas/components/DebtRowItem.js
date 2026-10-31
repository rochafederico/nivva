// src/features/deudas/components/DebtRowItem.js
// Clase JS que construye la fila <tr> de un monto de egreso con el diseño compartido (ListRow):
// 2 celdas: info (avatar + nombre + tipo + fecha) y acciones (monto + badge + toggle + chevron).

import '../../../shared/components/AppCheckbox.js';
import { formatMoneda } from '../../../shared/config/monedas.js';
import { formatFecha } from '../../../shared/utils/fechas.js';
import { createListRow } from '../../../shared/components/ListRow.js';

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
    return formatFecha(isoDate);
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
        this._showPaymentAction = options.showPaymentAction ?? true;
        this.element = this._build();
    }

    _build() {
        const row = this._rowData;
        if (!row) return document.createElement('tr');
        const excl = this._excludeColumns;

        // ── Estado badge (compartido) ──────────────────────────────────
        const badgeSpan = document.createElement('span');

        // El switch ya muestra pagado / pendiente: el badge solo aparece si aporta (Vencido, Vence hoy).
        const renderEstado = () => {
            badgeSpan.replaceChildren();
            const estado = getEstado(row);
            if (!estado || row.pagado || estado.label === 'Pendiente') return;
            const b = document.createElement('span');
            b.className = `badge ${estado.className} fw-normal lh-sm px-1 py-0 ms-2 text-nowrap`;
            b.textContent = estado.label;
            badgeSpan.appendChild(b);
        };

        // Exponer callbacks para sincronización externa
        row._renderEstadoPago = () => renderEstado();
        row._renderEstadoPagoCard = () => renderEstado();

        renderEstado();

        // ── Checkbox ─────────────────────────────────────────────────
        let cb = null;
        if (this._showPaymentAction) {
            cb = document.createElement('app-checkbox');
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
                    // Avisar a quien muestre totales (KPIs, acreedores) que cambió un monto
                    window.dispatchEvent(new CustomEvent('monto:updated', { detail: { id: row.id, pagado: nextChecked } }));
                    window.dispatchEvent(new CustomEvent('app:notify', {
                        detail: {
                            message: nextChecked
                                ? '✅ Monto marcado como pagado.'
                                : '⚠️ Monto marcado como pendiente.',
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
        }

        // ── Detalle debajo del nombre: badge de tipo ─────────────────
        let tipoBadge = null;
        const tipo = String(row.tipoDeuda ?? '').trim();
        if (tipo && !excl.includes('tipoDeuda')) {
            tipoBadge = document.createElement('span');
            tipoBadge.className = 'badge rounded-pill bg-light text-secondary border fw-normal mt-1 d-inline-block text-truncate mw-100';
            const tipoIcon = document.createElement('i');
            tipoIcon.className = `bi ${getTipoIcon(tipo)} me-1`;
            tipoIcon.setAttribute('aria-hidden', 'true');
            tipoBadge.appendChild(tipoIcon);
            tipoBadge.appendChild(document.createTextNode(tipo));
        }

        const canOpen = this._showDetailAction && typeof row._onRowClick === 'function';
        const tr = createListRow({
            avatar: { text: getInitials(row.acreedor), className: getAvatarClasses(row.acreedor) },
            title: row.acreedor ?? '',
            date: row.vencimiento,
            detail: tipoBadge,
            amount: formatMoneda(row.monto, row.moneda),
            status: badgeSpan,
            controls: cb ? [cb] : [],
            onOpen: canOpen ? (opener) => row._onRowClick(row, opener) : null,
            openLabel: `Ver detalle de ${row.acreedor || 'este egreso'}`,
        });

        return tr;
    }
}
