// src/features/deudas/components/AcreedoresList.js
// Web Component <acreedores-list>: todos los egresos (no depende del mes).
// Cada fila abre el detalle al tocarla; Editar y Eliminar quedan en el menú "⋮".
// El avance se muestra como barra de progreso "x de y cuotas".
// Usa los modales #debtModal y #debtDetailModal del documento.
import { createDropdown, destroyDropdown } from '../../../shared/ui/bootstrap/index.js';

const RELOAD_EVENTS = ['deuda:saved', 'deuda:updated', 'deuda:deleted', 'data-imported', 'monto:updated'];

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function fmtMoneda(moneda, n) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: moneda }).format(n);
}

/** Pendiente (impago) por moneda de una lista de montos. */
export function computePendiente(montos) {
    const totals = {};
    (montos || []).forEach(m => {
        if (!m.pagado) {
            totals[m.moneda] = (totals[m.moneda] || 0) + Number(m.monto);
        }
    });
    return totals;
}

/** Avance de pagos de un egreso: { pagadas, total, porcentaje, texto: "1 de 2 cuotas" }. */
export function progresoCuotas(montos = []) {
    const total = montos.length;
    const pagadas = montos.filter(m => m.pagado).length;
    const porcentaje = total ? Math.round((pagadas / total) * 100) : 0;
    return { pagadas, total, porcentaje, texto: `${pagadas} de ${total} ${total === 1 ? 'cuota' : 'cuotas'}` };
}

export class AcreedoresList extends HTMLElement {
    constructor() {
        super();
        this.entities = [];
        this._dropdowns = [];
    }

    connectedCallback() {
        this.classList.add('d-block');
        this.innerHTML = '<div id="entity-table-container"></div>';
        this._onReload = () => this.load();
        RELOAD_EVENTS.forEach(type => window.addEventListener(type, this._onReload));
        this.load();
    }

    disconnectedCallback() {
        RELOAD_EVENTS.forEach(type => window.removeEventListener(type, this._onReload));
        this._disposeDropdowns();
    }

    async load() {
        const requestId = (this._requestId = (this._requestId || 0) + 1);
        const { listDeudas } = await import('../deudaRepository.js');
        const entities = await listDeudas();
        if (requestId !== this._requestId) return;
        this.entities = entities;
        this.renderTable();
    }

    _disposeDropdowns() {
        this._dropdowns.forEach(destroyDropdown);
        this._dropdowns = [];
    }

    _rowHtml(deuda) {
        const acreedor = escapeHtml(deuda.acreedor);
        const pendiente = computePendiente(deuda.montos);
        const pendienteStr = Object.keys(pendiente).length
            ? Object.entries(pendiente).map(([moneda, tot]) => fmtMoneda(moneda, tot)).join(' | ')
            : 'Pagado';
        const progreso = progresoCuotas(deuda.montos || []);
        return `
            <tr class="cursor-pointer" data-row-id="${deuda.id}">
                <td class="py-3">
                    <h6 class="fw-bold text-break mb-0">
                        <button type="button" class="list-row-title" data-detail-id="${deuda.id}"
                            aria-label="Ver detalle de ${acreedor}">${acreedor}</button>
                    </h6>
                    <div class="small text-body-secondary">${escapeHtml(deuda.tipoDeuda || '—')}</div>
                    <div class="d-flex align-items-center gap-2 mt-1">
                        <div class="progress acreedor-progress flex-grow-1" role="progressbar"
                            aria-label="Cuotas pagadas de ${acreedor}"
                            aria-valuenow="${progreso.pagadas}" aria-valuemin="0" aria-valuemax="${progreso.total}">
                            <div class="progress-bar bg-success" style="width: ${progreso.porcentaje}%"></div>
                        </div>
                        <small class="acreedor-progress-text text-body-secondary text-nowrap">${progreso.texto}</small>
                    </div>
                </td>
                <td class="py-3 pe-1 text-end align-middle">
                    <div class="d-flex align-items-center justify-content-end gap-1">
                        <div>
                            <div class="small text-body-secondary">Pendiente</div>
                            <div class="fw-semibold text-nowrap">${escapeHtml(pendienteStr)}</div>
                        </div>
                        <div class="dropdown">
                            <button type="button" class="btn btn-link text-body-secondary px-2 acreedor-menu-btn"
                                data-bs-toggle="dropdown" aria-expanded="false"
                                aria-label="Más acciones para ${acreedor}">
                                <i class="bi bi-three-dots-vertical" aria-hidden="true"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                                <li>
                                    <button type="button" class="dropdown-item" data-edit-id="${deuda.id}">
                                        <i class="bi bi-pencil me-2" aria-hidden="true"></i>Editar
                                    </button>
                                </li>
                                <li>
                                    <button type="button" class="dropdown-item text-danger" data-delete-id="${deuda.id}" data-acreedor="${acreedor}">
                                        <i class="bi bi-trash me-2" aria-hidden="true"></i>Eliminar
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }

    renderTable() {
        const container = this.querySelector('#entity-table-container');
        if (!container) return;
        this._disposeDropdowns();

        if (this.entities.length === 0) {
            container.innerHTML = '<p class="text-muted text-center py-4">Todavía no cargaste egresos. Tocá <strong>+</strong> para agregar el primero.</p>';
            return;
        }

        container.innerHTML = `
            <table class="table table-hover align-middle mb-0">
                <tbody>${this.entities.map(deuda => this._rowHtml(deuda)).join('')}</tbody>
            </table>
        `;

        const findDeuda = (id) => this.entities.find(d => d.id === Number(id));
        const openDetail = (deuda, opener) => {
            const detailModal = document.getElementById('debtDetailModal');
            if (!deuda || !detailModal) return;
            detailModal.openDetail(deuda);
            detailModal.attachOpener(opener);
        };

        // Tocar la fila (fuera del menú "⋮") abre el detalle
        container.querySelectorAll('tr[data-row-id]').forEach(tr => {
            tr.addEventListener('click', (e) => {
                if (e.target.closest('.dropdown')) return;
                const titleBtn = tr.querySelector('.list-row-title');
                openDetail(findDeuda(tr.dataset.rowId), titleBtn);
            });
        });

        // Menú "⋮": el popper se posiciona fijo para que la tabla no lo recorte
        container.querySelectorAll('.acreedor-menu-btn').forEach(btn => {
            const instance = createDropdown(btn, { popperConfig: { strategy: 'fixed' } });
            if (instance) this._dropdowns.push(instance);
        });

        container.querySelectorAll('[data-edit-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const deuda = findDeuda(btn.dataset.editId);
                const modal = document.getElementById('debtModal');
                if (!deuda || !modal) return;
                modal.openEdit(deuda);
                modal.attachOpener?.(btn.closest('.dropdown')?.querySelector('.acreedor-menu-btn') || btn);
            });
        });

        container.querySelectorAll('[data-delete-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.deleteId);
                const acreedor = btn.dataset.acreedor;
                if (!confirm(`Vas a eliminar el egreso de "${acreedor}" y todos sus montos. No se puede recuperar. ¿Continuás?`)) return;
                import('../use-cases/deleteDeudaWithTrackingUseCase.js').then(({ deleteDeudaWithTrackingUseCase }) => {
                    deleteDeudaWithTrackingUseCase(id).then(() => {
                        window.dispatchEvent(new CustomEvent('deuda:deleted'));
                    });
                });
            });
        });
    }
}

customElements.define('acreedores-list', AcreedoresList);
