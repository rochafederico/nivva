// src/features/deudas/components/DeudaTotal.js
// Web Component <deuda-total>: deuda total acumulada (todo lo impago, de todos los meses),
// consolidada por moneda. Se muestra fija arriba de la vista y se actualiza sola.
import { formatMoneda } from '../../../shared/config/monedas.js';
import { listDeudas } from '../deudaRepository.js';

const RELOAD_EVENTS = ['deuda:saved', 'deuda:updated', 'deuda:deleted', 'data-imported', 'monto:updated'];

/** Suma por moneda de los montos impagos de todas las deudas. */
export function sumDeudaPendiente(deudas = []) {
    const totals = {};
    deudas.forEach(deuda => {
        (deuda.montos || []).forEach(m => {
            if (!m.pagado) totals[m.moneda] = (totals[m.moneda] || 0) + (Number(m.monto) || 0);
        });
    });
    return totals;
}

/**
 * Texto de la deuda total: "$ 39.953.743,60 ARS / US$ 4.124,00".
 * ARS primero y con su código (el "$" solo es ambiguo); sin deuda: "$ 0,00 ARS".
 */
export function formatDeudaTotal(totals = {}) {
    const entries = Object.entries(totals)
        .filter(([, v]) => Number(v) > 0)
        .sort(([a], [b]) => (a === 'ARS' ? -1 : b === 'ARS' ? 1 : a.localeCompare(b)));
    if (entries.length === 0) return `${formatMoneda(0, 'ARS')} ARS`;
    return entries
        .map(([moneda, total]) => (moneda === 'ARS' ? `${formatMoneda(total, 'ARS')} ARS` : formatMoneda(total, moneda)))
        .join(' / ');
}

export class DeudaTotal extends HTMLElement {
    connectedCallback() {
        this.classList.add('d-block', 'sticky-top', 'deuda-total');
        this.innerHTML = `
            <button type="button" class="deuda-total-btn btn btn-primary w-100 d-flex flex-wrap align-items-center justify-content-between column-gap-3 text-start rounded-3 shadow-sm px-3 py-2">
                <span class="small fw-semibold">
                    <i class="bi bi-bank me-1" aria-hidden="true"></i>Deuda total acumulada
                </span>
                <strong class="deuda-total-monto text-nowrap">…</strong>
            </button>
        `;
        this._onReload = () => this.load();
        RELOAD_EVENTS.forEach(type => window.addEventListener(type, this._onReload));
        this.load();
    }

    disconnectedCallback() {
        RELOAD_EVENTS.forEach(type => window.removeEventListener(type, this._onReload));
    }

    async load() {
        const requestId = (this._requestId = (this._requestId || 0) + 1);
        const deudas = await listDeudas();
        if (requestId !== this._requestId || !this.isConnected) return;
        this.totals = sumDeudaPendiente(deudas);
        const monto = this.querySelector('.deuda-total-monto');
        if (monto) monto.textContent = formatDeudaTotal(this.totals);
    }
}

customElements.define('deuda-total', DeudaTotal);
