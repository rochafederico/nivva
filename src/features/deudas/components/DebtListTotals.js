// src/features/deudas/components/DebtListTotals.js
// Web Component que muestra el resumen de totales del mes como tarjetas KPI:
// Una tarjeta por estado (Pendiente / Pagado) agrupando todas las monedas,
// con diseño Bootstrap 5.3 + Bootstrap Icons.

export class DebtListTotals extends HTMLElement {
    connectedCallback() {
        this._pendiente = this._pendiente || {};
        this._pagado = this._pagado || {};
        this._vencidas = this._vencidas || 0;
        this._pagadosCount = this._pagadosCount || 0;
        this._fmtCache = new Map();
        this._render();
    }

    /**
     * Actualiza los totales y re-renderiza el componente.
     * @param {Object} pendiente     - Mapa moneda → monto pendiente (ej. { ARS: 15000, USD: 100 })
     * @param {Object} pagado        - Mapa moneda → monto pagado   (ej. { ARS: 5000 })
     * @param {number} vencidas      - Cantidad de cuotas vencidas no pagadas
     * @param {number} pagadosCount  - Cantidad de cuotas pagadas
     */
    update(pendiente, pagado, vencidas = 0, pagadosCount = 0) {
        this._pendiente = pendiente || {};
        this._pagado = pagado || {};
        this._vencidas = vencidas || 0;
        this._pagadosCount = pagadosCount || 0;
        this._render();
    }

    _fmtMoneda(moneda, n) {
        if (!this._fmtCache) this._fmtCache = new Map();
        if (!this._fmtCache.has(moneda)) {
            this._fmtCache.set(moneda, new Intl.NumberFormat('es-AR', { style: 'currency', currency: moneda }));
        }
        return this._fmtCache.get(moneda).format(n || 0);
    }

    /** Formatea un mapa moneda→monto como "$ 1.234 / USD 50,00" */
    _fmtAmounts(amountsMap) {
        return Object.entries(amountsMap)
            .filter(([, v]) => Number(v) > 0)
            .map(([m, v]) => this._fmtMoneda(m, Number(v)))
            .join(' / ');
    }

    _render() {
        const pendiente = this._pendiente || {};
        const pagado = this._pagado || {};

        this.innerHTML = '';

        const hasPendiente = Object.values(pendiente).some(v => Number(v) > 0);
        const hasPagado = Object.values(pagado).some(v => Number(v) > 0);

        if (!hasPendiente && !hasPagado) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'd-flex flex-wrap gap-3 px-3 py-3 border-top';

        if (hasPendiente) {
            wrapper.appendChild(this._createCard(
                'Pendiente', pendiente, 'warning', 'bi-hourglass-split', this._vencidas, 0
            ));
        }
        if (hasPagado) {
            wrapper.appendChild(this._createCard(
                'Pagado', pagado, 'success', 'bi-check-circle-fill', 0, this._pagadosCount
            ));
        }

        this.appendChild(wrapper);
    }

    /**
     * Crea una tarjeta KPI para un estado, mostrando todas las monedas agrupadas.
     * @param {string} label        - "Pendiente" | "Pagado"
     * @param {Object} amountsMap   - Mapa moneda → monto
     * @param {string} colorKey     - "warning" | "success"
     * @param {string} iconClass    - Clase Bootstrap Icon
     * @param {number} vencidas     - Cuotas vencidas (solo Pendiente)
     * @param {number} pagadosCount - Cuotas pagadas (solo Pagado)
     */
    _createCard(label, amountsMap, colorKey, iconClass, vencidas, pagadosCount) {
        const col = document.createElement('div');
        col.className = 'flex-fill';

        const card = document.createElement('div');
        card.className = `card shadow-sm rounded-4 border-0 bg-${colorKey}-subtle`;

        const body = document.createElement('div');
        body.className = 'd-flex justify-content-between align-items-center p-3';

        // Bloque de texto izquierdo: etiqueta + monto(s) + indicadores
        const textBlock = document.createElement('div');
        textBlock.className = 'flex-grow-1 me-3';

        const labelEl = document.createElement('div');
        labelEl.className = `small fw-medium text-uppercase text-${colorKey}-emphasis mb-1`;
        labelEl.textContent = label;
        textBlock.appendChild(labelEl);

        const amountEl = document.createElement('div');
        amountEl.className = `fw-bold fs-4 lh-1 text-${colorKey}-emphasis`;
        amountEl.textContent = this._fmtAmounts(amountsMap);
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

        if (pagadosCount > 0) {
            const pagadosEl = document.createElement('div');
            pagadosEl.className = `small text-${colorKey}-emphasis mt-1`;
            const icon = document.createElement('i');
            icon.className = 'bi bi-check2 me-1';
            const txt = document.createTextNode(
                `${pagadosCount} pagado${pagadosCount !== 1 ? 's' : ''}`
            );
            pagadosEl.appendChild(icon);
            pagadosEl.appendChild(txt);
            textBlock.appendChild(pagadosEl);
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
