import './DebtDetailModal.js';
import { DebtRowItem } from './DebtRowItem.js';
import './DebtListTotals.js';
import { getSelectedMonth } from '../../../shared/MonthFilter.js';

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
        window.removeEventListener('deuda:edit', this._onEdit);
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
        this._onEdit = (e) => this.editDebt(e.detail);

        window.addEventListener('ui:month', this._onMonth);
        window.addEventListener('ui:group', this._onGroup);
        window.addEventListener('deuda:saved', this._onLoad);
        window.addEventListener('deuda:updated', this._onLoad);
        window.addEventListener('deuda:deleted', this._onLoad);
        window.addEventListener('data-imported', this._onLoad);
        window.addEventListener('deuda:edit', this._onEdit);
    }

    async loadDebts() {
        if (!this.mes) this.mes = new Date().toISOString().slice(0, 7);
        const debts = await this.listByMes(this.mes);
        this.debts = debts;
        console.log('[DebtList] Deudas cargadas:', debts); // Debug: muestra las deudas recuperadas
        await this.loadTotals();
        this.renderTable();
    }

    async loadTotals() {
        // Consulta las cuotas originales desde el repository y calcula los totales
        const { countCuotasByMes } = await import('../../cuotas/cuotaRepository.js');
        const { totalesPendientes, totalesPagados } = await countCuotasByMes({ mes: this.mes });
        this.totalesPendientes = totalesPendientes;
        this.totalesPagados = totalesPagados;
    }

    async listByMes(mes) {
        // Usa cuotaRepository para consultar cuotas por periodo 'YYYY-MM' y agrupar por deuda
        const { listCuotas } = await import('../../cuotas/cuotaRepository.js');
        const { getDeuda } = await import('../deudaRepository.js');
        const cuotas = await listCuotas({ mes }); // mes es 'YYYY-MM'
        const deudaIds = [...new Set(cuotas.map(m => m.deudaId))];
        const deudas = [];
        for (const id of deudaIds) {
            const deuda = await getDeuda(id);
            if (!deuda) continue;
            deuda.cuotas = cuotas.filter(m => m.deudaId === id);
            deudas.push(deuda);
        }
        return deudas;
    }

    renderTable() {
        // Unificar todos las cuotas en un solo array con referencia a la deuda
        let allCuotas = this.debts.reduce((arr, deuda) => {
            deuda.cuotas.forEach(cuota => {
                arr.push({ ...cuota, acreedor: deuda.acreedor, tipoDeuda: deuda.tipoDeuda });
            });
            return arr;
        }, []);

        // Agrupamiento dinámico
        if (this.groupBy !== 'none') {
            allCuotas = this.groupCuotas(allCuotas, this.groupBy);
        }

        // Ordenar por fecha de vencimiento ascendente
        allCuotas.sort((a, b) => new Date(a.vencimiento) - new Date(b.vencimiento));

        // Mapear datos de la tabla enriqueciendo con callbacks
        const tableData = allCuotas.map(row => {
            const entry = {
                ...row,
                _fmtMoneda: this.fmtMoneda.bind(this),
                _onDetail: async (cuota, opener) => {
                    const detailModal = document.querySelector('app-shell #debtDetailModal')
                        || document.getElementById('debtDetailModal');
                    if (!detailModal) return;
                    const { getDeuda } = await import('../deudaRepository.js');
                    const deudaActualizada = await getDeuda(cuota.deudaId);
                    detailModal.openDetail(deudaActualizada);
                    detailModal.attachOpener(opener || null);
                },
                _onEdit: async (cuota) => {
                    const { getDeuda } = await import('../deudaRepository.js');
                    const deuda = await getDeuda(cuota.deudaId);
                    window.dispatchEvent(new CustomEvent('deuda:edit', { detail: deuda }));
                },
                _reload: this.loadDebts.bind(this)
            };
            entry._onRowClick = (cuota, opener) => entry._onDetail(cuota, opener || null);
            return entry;
        });

        const container = this.querySelector('.debt-list-container');
        const isUngroupedView = this.groupBy === 'none';

        this._renderRowTable(container, tableData, {
            showDetailAction: this._showDetailAction,
            showPaymentAction: isUngroupedView,
        });

        this._renderTotals();
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
            td.textContent = 'No hay cuotas para este mes.';
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        tableData.forEach(row => {
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

    async editDebt(deuda) {
        const editModal = document.querySelector('app-shell #debtModal')
            || document.getElementById('debtModal');
        if (!editModal || !deuda) return;
        editModal.openEdit(deuda);
        editModal.attachOpener();
    }

    deleteDebt(id, acreedor, cuota, vencimiento, periodo, moneda) {
        const cuotaFmt = this.fmtMoneda(moneda, cuota);
        if (!confirm(`¿Seguro que quieres borrar los ${cuotaFmt} que le debes a "${acreedor}"?\nVencimiento: ${vencimiento} | Periodo: ${periodo}`)) return;
        import('../../cuotas/cuotaRepository.js').then(({ deleteCuota }) => {
            deleteCuota(id).then(() => {
                this.loadDebts(); // Actualiza la tabla tras borrar
            });
        });
    }

    fmtMoneda(moneda, n) {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: moneda }).format(n);
    }

    _renderTotals() {
        let totalsEl = this._externalTotals || this.querySelector('debt-list-totals');
        if (!totalsEl) return;

        const pendiente = this.totalesPendientes || {};
        const pagado = this.totalesPagados || {};

        totalsEl.update(pendiente, pagado, { debts: this.debts || [] });
    }

    render() {
        this.innerHTML = '<div class="debt-list-container"></div><debt-list-totals></debt-list-totals>';
    }

    /**
     * Registers an external debt-list-totals element (outside the card) that
     * _renderTotals() will update instead of the one embedded inside this component.
     * Called by DebtEntityShell after it moves the element outside the card.
     * @param {HTMLElement} el - The debt-list-totals element to use
     */
    setExternalTotals(el) {
        this._externalTotals = el;
    }

    groupCuotas(cuotas, groupBy) {
        // Devuelve un array agrupado según el criterio, siempre separando por moneda salvo si el filtro es 'moneda'
        const grouped = {};
        cuotas.forEach(cuota => {
            let key = '';
            switch (groupBy) {
                case 'acreedor': key = `${cuota.acreedor}__${cuota.moneda}`; break;
                case 'tipo': key = `${cuota.tipoDeuda}__${cuota.moneda}`; break;
                case 'vencimiento': key = `${cuota.vencimiento}__${cuota.moneda}`; break;
                case 'moneda': key = cuota.moneda; break;
                default: key = `Otros__${cuota.moneda}`;
            }
            // Separar por estado pagado
            key += `__${cuota.pagado ? 'pagado' : 'pendiente'}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(cuota);
        });
        // Devuelve un array donde cada elemento es un resumen del grupo
        return Object.entries(grouped).map(([group, items]) => {
            const total = items.reduce((sum, m) => sum + (Number(m.cuota) || 0), 0);
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
                cuota: total,
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
