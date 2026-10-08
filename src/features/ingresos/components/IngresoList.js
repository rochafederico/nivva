// src/features/ingresos/components/IngresoList.js
// Web Component <ingreso-list>: ingresos del mes seleccionado con el diseño de fila compartido (ListRow).
// Se actualiza solo al cambiar de mes, al agregar un ingreso o al importar datos.
import { formatMoneda } from '../../../shared/config/monedas.js';
import { createListRow } from '../../../shared/components/ListRow.js';
import { getSelectedMonth } from '../../../shared/MonthFilter.js';
import { listIngresos } from '../ingresoRepository.js';

export const INGRESOS_EMPTY_TEXT = 'No tenés ingresos registrados para este período.';
const RELOAD_EVENTS = ['ui:month', 'ingreso:added', 'data-imported'];

/** Fila de un ingreso: ícono, descripción, fecha y monto en verde con signo +. */
export function createIngresoRow(ingreso) {
    return createListRow({
        avatar: { icon: 'bi-cash-stack', className: 'bg-success-subtle text-success-emphasis' },
        title: ingreso.descripcion || 'Ingreso',
        date: ingreso.fecha,
        amount: `+ ${formatMoneda(ingreso.monto, ingreso.moneda)}`,
        amountClassName: 'text-success-emphasis',
    });
}

export class IngresoList extends HTMLElement {
    connectedCallback() {
        this.classList.add('d-block');
        this.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover table-striped mb-0">
                    <tbody></tbody>
                </table>
            </div>
        `;
        this._onReload = () => this.load();
        RELOAD_EVENTS.forEach(type => window.addEventListener(type, this._onReload));
        this.load();
    }

    disconnectedCallback() {
        RELOAD_EVENTS.forEach(type => window.removeEventListener(type, this._onReload));
    }

    async load() {
        // Si llegan dos cargas seguidas (p. ej. navegación rápida de meses) solo vale la última.
        const requestId = (this._requestId = (this._requestId || 0) + 1);
        const ingresos = await listIngresos({ mes: getSelectedMonth() });
        if (requestId !== this._requestId || !this.isConnected) return;
        this.render(ingresos);
    }

    render(ingresos = []) {
        const tbody = this.querySelector('tbody');
        if (!tbody) return;
        if (ingresos.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 2;
            td.className = 'text-muted text-center py-4';
            td.textContent = INGRESOS_EMPTY_TEXT;
            tr.appendChild(td);
            tbody.replaceChildren(tr);
            return;
        }
        const ordenados = [...ingresos].sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
        tbody.replaceChildren(...ordenados.map(createIngresoRow));
    }
}

customElements.define('ingreso-list', IngresoList);
