// src/features/deudas/components/DebtListTotals.js
// Web Component que muestra el resumen de totales del mes:
// Total pendiente y total pagado, por moneda, con diseño Bootstrap 5.3.

export class DebtListTotals extends HTMLElement {
    connectedCallback() {
        this._pendiente = this._pendiente || {};
        this._pagado = this._pagado || {};
        this._render();
    }

    /**
     * Actualiza los totales y re-renderiza el componente.
     * @param {Object} pendiente - Mapa moneda → monto pendiente (ej. { ARS: 15000, USD: 100 })
     * @param {Object} pagado    - Mapa moneda → monto pagado   (ej. { ARS: 5000 })
     */
    update(pendiente, pagado) {
        this._pendiente = pendiente || {};
        this._pagado = pagado || {};
        this._render();
    }

    _fmtMoneda(moneda, n) {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: moneda }).format(n || 0);
    }

    _render() {
        const pendiente = this._pendiente || {};
        const pagado = this._pagado || {};
        const currencies = new Set([...Object.keys(pendiente), ...Object.keys(pagado)]);

        // Limpiar contenido anterior
        this.innerHTML = '';

        if (currencies.size === 0) return;

        const hasPendiente = [...currencies].some(m => Number(pendiente[m]) > 0);
        const hasPagado = [...currencies].some(m => Number(pagado[m]) > 0);

        if (!hasPendiente && !hasPagado) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'd-flex flex-wrap gap-2 px-3 py-3 border-top';

        for (const moneda of currencies) {
            const pVal = Number(pendiente[moneda]) || 0;
            const pgVal = Number(pagado[moneda]) || 0;

            if (pVal > 0) {
                wrapper.appendChild(this._createItem('Pendiente', moneda, pVal, 'warning'));
            }
            if (pgVal > 0) {
                wrapper.appendChild(this._createItem('Pagado', moneda, pgVal, 'success'));
            }
        }

        this.appendChild(wrapper);
    }

    /**
     * Crea un bloque de resumen para una categoría/moneda.
     * @param {string} label    - "Pendiente" | "Pagado"
     * @param {string} moneda   - Código ISO de moneda (ARS, USD, …)
     * @param {number} amount   - Monto a mostrar
     * @param {string} colorKey - "warning" | "success"
     */
    _createItem(label, moneda, amount, colorKey) {
        const col = document.createElement('div');
        col.className = 'flex-fill';

        const inner = document.createElement('div');
        inner.className = `d-flex align-items-center justify-content-between gap-3 px-3 py-2 rounded bg-${colorKey}-subtle`;

        const labelEl = document.createElement('span');
        labelEl.className = `small fw-medium text-${colorKey}-emphasis`;
        labelEl.textContent = label;

        const amountEl = document.createElement('span');
        amountEl.className = `fw-semibold text-${colorKey}-emphasis`;
        amountEl.textContent = this._fmtMoneda(moneda, amount);

        inner.appendChild(labelEl);
        inner.appendChild(amountEl);
        col.appendChild(inner);
        return col;
    }
}

customElements.define('debt-list-totals', DebtListTotals);
