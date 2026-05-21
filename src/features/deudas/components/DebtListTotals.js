// src/features/deudas/components/DebtListTotals.js
// Web Component que muestra el resumen de totales del mes como tarjetas KPI:
// Total pendiente y total pagado, por moneda, con diseño Bootstrap 5.3 + Bootstrap Icons.

export class DebtListTotals extends HTMLElement {
    connectedCallback() {
        this._pendiente = this._pendiente || {};
        this._pagado = this._pagado || {};
        this._vencidas = this._vencidas || 0;
        this._fmtCache = new Map();
        this._render();
    }

    /**
     * Actualiza los totales y re-renderiza el componente.
     * @param {Object} pendiente - Mapa moneda → monto pendiente (ej. { ARS: 15000, USD: 100 })
     * @param {Object} pagado    - Mapa moneda → monto pagado   (ej. { ARS: 5000 })
     * @param {number} vencidas  - Cantidad de cuotas vencidas no pagadas
     */
    update(pendiente, pagado, vencidas = 0) {
        this._pendiente = pendiente || {};
        this._pagado = pagado || {};
        this._vencidas = vencidas || 0;
        this._render();
    }

    _fmtMoneda(moneda, n) {
        if (!this._fmtCache) this._fmtCache = new Map();
        if (!this._fmtCache.has(moneda)) {
            this._fmtCache.set(moneda, new Intl.NumberFormat('es-AR', { style: 'currency', currency: moneda }));
        }
        return this._fmtCache.get(moneda).format(n || 0);
    }

    _render() {
        const pendiente = this._pendiente || {};
        const pagado = this._pagado || {};
        const currencies = new Set(Object.keys(pendiente).concat(Object.keys(pagado)));

        this.innerHTML = '';

        if (currencies.size === 0) return;

        const hasPendiente = [...currencies].some(m => Number(pendiente[m]) > 0);
        const hasPagado = [...currencies].some(m => Number(pagado[m]) > 0);

        if (!hasPendiente && !hasPagado) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'd-flex flex-wrap gap-3 px-3 py-3 border-top';

        for (const moneda of currencies) {
            const pVal = Number(pendiente[moneda]) || 0;
            const pgVal = Number(pagado[moneda]) || 0;

            if (pVal > 0) {
                wrapper.appendChild(this._createCard(
                    'Pendiente', moneda, pVal, 'warning', 'bi-cash-stack', this._vencidas
                ));
            }
            if (pgVal > 0) {
                wrapper.appendChild(this._createCard(
                    'Pagado', moneda, pgVal, 'success', 'bi-piggy-bank', 0
                ));
            }
        }

        this.appendChild(wrapper);
    }

    /**
     * Crea una tarjeta KPI para una categoría/moneda.
     * @param {string} label     - "Pendiente" | "Pagado"
     * @param {string} moneda    - Código ISO de moneda (ARS, USD, …)
     * @param {number} amount    - Monto a mostrar
     * @param {string} colorKey  - "warning" | "success"
     * @param {string} iconClass - Clase Bootstrap Icon (ej. "bi-cash-stack")
     * @param {number} vencidas  - Cantidad de cuotas vencidas (solo se muestra en Pendiente)
     */
    _createCard(label, moneda, amount, colorKey, iconClass, vencidas) {
        const col = document.createElement('div');
        col.className = 'flex-fill';

        const card = document.createElement('div');
        card.className = `card shadow-sm rounded-4 border-0 bg-${colorKey}-subtle`;

        const body = document.createElement('div');
        body.className = 'd-flex justify-content-between align-items-center p-3';

        // Bloque de texto izquierdo: etiqueta + monto + vencidas
        const textBlock = document.createElement('div');
        textBlock.className = 'flex-grow-1 me-3';

        const labelEl = document.createElement('div');
        labelEl.className = `small fw-medium text-uppercase text-${colorKey}-emphasis mb-1`;
        labelEl.textContent = label;
        textBlock.appendChild(labelEl);

        const amountEl = document.createElement('div');
        amountEl.className = `fw-bold fs-4 lh-1 text-${colorKey}-emphasis`;
        amountEl.textContent = this._fmtMoneda(moneda, amount);
        textBlock.appendChild(amountEl);

        if (vencidas > 0) {
            const vencidasEl = document.createElement('div');
            vencidasEl.className = 'small text-danger mt-1';
            const icon = document.createElement('i');
            icon.className = 'bi bi-exclamation-triangle me-1';
            const txt = document.createTextNode(
                `${vencidas} deuda${vencidas !== 1 ? 's' : ''} vencida${vencidas !== 1 ? 's' : ''}`
            );
            vencidasEl.appendChild(icon);
            vencidasEl.appendChild(txt);
            textBlock.appendChild(vencidasEl);
        }

        body.appendChild(textBlock);

        // Círculo decorativo con ícono a la derecha
        const iconCircle = document.createElement('div');
        iconCircle.className = `d-flex align-items-center justify-content-center rounded-circle bg-${colorKey} bg-opacity-25`;
        iconCircle.style.cssText = 'width:48px;height:48px;flex-shrink:0';

        const iconEl = document.createElement('i');
        iconEl.className = `bi ${iconClass} fs-4 text-${colorKey}-emphasis`;
        iconCircle.appendChild(iconEl);
        body.appendChild(iconCircle);

        card.appendChild(body);
        col.appendChild(card);
        return col;
    }
}

customElements.define('debt-list-totals', DebtListTotals);
