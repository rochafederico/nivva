import './DebtDetailModal.js';
import { DebtRowItem } from './DebtRowItem.js';
import { createIngresoRow } from '../../ingresos/components/IngresoList.js';
import { getSelectedMonth } from '../../../shared/MonthFilter.js';

// Atributos opcionales (vista única del mes):
//   include-ingresos  → mezcla los ingresos del mes con los montos (pestaña "Todo")
//   estado="pendiente" → muestra solo montos sin pagar

export class DebtList extends HTMLElement {
    constructor() {
        super();
        this.debts = [];
        this.mes = getSelectedMonth();
        this.groupBy = 'none'; // agrupamiento por defecto
    }

    connectedCallback() {
        this.classList.add('d-block');
        this._excludeColumns = (this.getAttribute('exclude-columns') || '').split(',').filter(Boolean);
        this._showDetailAction = this.hasAttribute('show-detail-action');
        this._includeIngresos = this.hasAttribute('include-ingresos');
        this._estado = this.getAttribute('estado') || '';
        this.render();
        this.loadDebts();
        this.addEventListeners();
    }

    disconnectedCallback() {
        window.removeEventListener('ui:month', this._onMonth);
        window.removeEventListener('ui:group', this._onGroup);
        window.removeEventListener('deuda:saved', this._onLoad);
        window.removeEventListener('deuda:updated', this._onLoad);
        window.removeEventListener('deuda:deleted', this._onLoad);
        window.removeEventListener('data-imported', this._onLoad);
        window.removeEventListener('ingreso:added', this._onLoad);
    }

    addEventListeners() {
        this._onMonth = (event) => {
            this.mes = event.detail.mes;
            this.loadDebts();
        };
        this._onGroup = (event) => {
            this.groupBy = event.detail.groupBy || 'none';
            this.renderTable();
        };
        this._onLoad = () => this.loadDebts();

        window.addEventListener('ui:month', this._onMonth);
        window.addEventListener('ui:group', this._onGroup);
        window.addEventListener('deuda:saved', this._onLoad);
        window.addEventListener('deuda:updated', this._onLoad);
        window.addEventListener('deuda:deleted', this._onLoad);
        window.addEventListener('data-imported', this._onLoad);
        if (this._includeIngresos) window.addEventListener('ingreso:added', this._onLoad);
    }

    async loadDebts() {
        if (!this.mes) this.mes = new Date().toISOString().slice(0, 7);
        // Si llegan dos cargas seguidas (p. ej. navegación rápida de meses) solo vale la última.
        const requestId = (this._requestId = (this._requestId || 0) + 1);
        const debts = await this.listByMes(this.mes);
        if (this._includeIngresos) {
            const { listIngresos } = await import('../../ingresos/ingresoRepository.js');
            const ingresos = await listIngresos({ mes: this.mes });
            if (requestId !== this._requestId) return;
            this.ingresos = ingresos;
        }
        if (requestId !== this._requestId) return;
        this.debts = debts;
        this.renderTable();
    }

    async listByMes(mes) {
        // Usa montoRepository para consultar montos por periodo 'YYYY-MM' y agrupar por deuda
        const { listMontos } = await import('../../montos/montoRepository.js');
        const { getDeuda } = await import('../deudaRepository.js');
        const montos = await listMontos({ mes }); // mes es 'YYYY-MM'
        const deudaIds = [...new Set(montos.map(m => m.deudaId))];
        const deudas = [];
        for (const id of deudaIds) {
            const deuda = await getDeuda(id);
            if (!deuda) continue;
            deuda.montos = montos.filter(m => m.deudaId === id);
            deudas.push(deuda);
        }
        return deudas;
    }

    renderTable() {
        // Unificar todos los montos en un solo array con referencia a la deuda
        let allMontos = this.debts.reduce((arr, deuda) => {
            deuda.montos.forEach(monto => {
                arr.push({ ...monto, acreedor: deuda.acreedor, tipoDeuda: deuda.tipoDeuda });
            });
            return arr;
        }, []);

        // Agrupamiento dinámico
        if (this.groupBy !== 'none') {
            allMontos = this.groupMontos(allMontos, this.groupBy);
        }

        // Ordenar por fecha de vencimiento ascendente
        allMontos.sort((a, b) => new Date(a.vencimiento) - new Date(b.vencimiento));

        // Mapear datos de la tabla enriqueciendo con callbacks
        const tableData = allMontos.map(row => {
            const entry = {
                ...row,
                _fmtMoneda: this.fmtMoneda.bind(this),
                _onDetail: async (monto, opener) => {
                    const detailModal = document.getElementById('debtDetailModal');
                    if (!detailModal) return;
                    const { getDeuda } = await import('../deudaRepository.js');
                    const deudaActualizada = await getDeuda(monto.deudaId);
                    detailModal.openDetail(deudaActualizada);
                    detailModal.attachOpener(opener || null);
                },
                _onEdit: async (monto) => {
                    const { getDeuda } = await import('../deudaRepository.js');
                    const deuda = await getDeuda(monto.deudaId);
                    window.dispatchEvent(new CustomEvent('deuda:edit', { detail: deuda }));
                },
                _reload: this.loadDebts.bind(this)
            };
            entry._onRowClick = (monto, opener) => entry._onDetail(monto, opener || null);
            return entry;
        });

        const container = this.querySelector('.debt-list-container');
        const isUngroupedView = this.groupBy === 'none';

        let rows = tableData;
        if (this._estado === 'pendiente') {
            rows = rows.filter(row => !row.pagado);
        }
        if (this._includeIngresos) {
            // Ingresos y montos en orden cronológico; a igual fecha, primero los ingresos.
            const ingresoRows = (this.ingresos || []).map(ingreso => ({ _kind: 'ingreso', ingreso }));
            const dateOf = row => String(row._kind === 'ingreso' ? row.ingreso.fecha : row.vencimiento);
            rows = [...ingresoRows, ...rows].sort((a, b) => dateOf(a).localeCompare(dateOf(b)));
        }

        this._renderRowTable(container, rows, {
            showDetailAction: this._showDetailAction,
            showPaymentAction: isUngroupedView,
        });
    }

    // Renderiza una tabla Bootstrap con filas <tr> construidas por DebtRowItem.
    // Usa un layout unificado con 2 columnas (info + acciones) en todos los breakpoints.
    _renderRowTable(container, tableData, options = {}) {
        let tableWrapper = container.querySelector('.table-responsive');
        let tbody;

        if (!tableWrapper) {
            container.innerHTML = '';
            tableWrapper = document.createElement('div');
            tableWrapper.className = 'table-responsive';

            const table = document.createElement('table');
            table.className = 'table table-hover table-striped mb-0';

            tbody = document.createElement('tbody');
            table.appendChild(tbody);
            tableWrapper.appendChild(table);
            container.appendChild(tableWrapper);
        } else {
            tbody = tableWrapper.querySelector('tbody');
        }

        // Reconstruir filas
        tbody.innerHTML = '';

        if (tableData.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 99;
            td.className = 'text-muted text-center py-4';
            td.textContent = this._emptyText();
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        tableData.forEach(row => {
            if (row._kind === 'ingreso') {
                tbody.appendChild(createIngresoRow(row.ingreso));
                return;
            }
            const rowItem = new DebtRowItem(row, {
                excludeColumns: this._excludeColumns || [],
                showDetailAction: options.showDetailAction ?? this._showDetailAction,
                showPaymentAction: options.showPaymentAction ?? true,
            });
            tbody.appendChild(rowItem.element);
        });
    }

    toggleEstado(id) {
        const debt = this.debts.find(d => d.id === id);
        debt.estadoPagada = !debt.estadoPagada;
        window.db.updateDeuda(debt);
        this.renderTable();
    }

    deleteDebt(id, acreedor, monto, vencimiento, periodo, moneda) {
        const montoFmt = this.fmtMoneda(moneda, monto);
        if (!confirm(`¿Seguro que quieres borrar los ${montoFmt} que le debes a "${acreedor}"?\nVencimiento: ${vencimiento} | Periodo: ${periodo}`)) return;
        import('../../montos/montoRepository.js').then(({ deleteMonto }) => {
            deleteMonto(id).then(() => {
                this.loadDebts(); // Actualiza la tabla tras borrar
            });
        });
    }

    fmtMoneda(moneda, n) {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: moneda }).format(n);
    }

    _emptyText() {
        if (this._includeIngresos) return 'Todavía no hay movimientos este mes. Agregá un ingreso o un egreso.';
        if (this._estado === 'pendiente') return 'No quedan montos por pagar este mes.';
        return 'Todavía no hay egresos este mes. Agregá el primero.';
    }

    render() {
        this.innerHTML = '<div class="debt-list-container"></div>';
    }

    groupMontos(montos, groupBy) {
        // Devuelve un array agrupado según el criterio, siempre separando por moneda salvo si el filtro es 'moneda'
        const grouped = {};
        montos.forEach(monto => {
            let key = '';
            switch (groupBy) {
                case 'acreedor': key = `${monto.acreedor}__${monto.moneda}`; break;
                case 'tipo': key = `${monto.tipoDeuda}__${monto.moneda}`; break;
                case 'vencimiento': key = `${monto.vencimiento}__${monto.moneda}`; break;
                case 'moneda': key = monto.moneda; break;
                default: key = `Otros__${monto.moneda}`;
            }
            // Separar por estado pagado
            key += `__${monto.pagado ? 'pagado' : 'pendiente'}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(monto);
        });
        // Devuelve un array donde cada elemento es un resumen del grupo
        return Object.entries(grouped).map(([group, items]) => {
            const total = items.reduce((sum, m) => sum + (Number(m.monto) || 0), 0);
            const acreedores = [...new Set(items.map(m => m.acreedor))].join(', ');
            const tipos = [...new Set(items.map(m => m.tipoDeuda))].join(', ');
            const vencimientos = [...new Set(items.map(m => m.vencimiento))].join(', ');
            const moneda = items[0].moneda;
            let groupLabel = group;
            let pagado = items[0].pagado;
            if (group.includes('__')) {
                const parts = group.split('__');
                groupLabel = parts[0];
                pagado = parts[parts.length - 1] === 'pagado';
            }
            return {
                ...items[0],
                monto: total,
                groupLabel,
                items: items,
                acreedor: (groupBy !== 'acreedor') ? acreedores : groupLabel,
                tipoDeuda: (groupBy !== 'tipo') ? tipos : groupLabel,
                vencimiento: (groupBy !== 'vencimiento') ? vencimientos : groupLabel,
                moneda,
                pagado
            };
        });
    }
}

customElements.define('debt-list', DebtList);
