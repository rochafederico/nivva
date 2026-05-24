// src/features/deudas/components/DebtListTotals.js
// Web Component que muestra el resumen de totales del mes como tarjetas KPI:
// Una tarjeta por estado (Pendiente / Pagado) agrupando todas las monedas,
// con diseño Bootstrap 5.3 + Bootstrap Icons.

function getLocalTodayYmd() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isValidYmd(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function summarizeDebtListTotals(debts = [], today = getLocalTodayYmd()) {
    let vencidas = 0;
    let pagadosCount = 0;

    (debts || []).forEach(deuda => {
        (deuda.montos || []).forEach(monto => {
            const vencimiento = typeof monto.vencimiento === 'string' ? monto.vencimiento.trim() : '';
            if (!monto.pagado && isValidYmd(vencimiento) && vencimiento < today) vencidas++;
            if (monto.pagado) pagadosCount++;
        });
    });

    return { vencidas, pagadosCount };
}

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
     * @param {Object} summary       - { debts } para calcular indicadores
     */
    update(pendiente, pagado, summary = {}) {
        this._pendiente = pendiente || {};
        this._pagado = pagado || {};

        const { vencidas, pagadosCount } = summarizeDebtListTotals(summary?.debts || [], summary?.today);
        this._vencidas = vencidas;
        this._pagadosCount = pagadosCount;

        this._render();
    }

    _fmtMoneda(moneda, n) {
        if (!this._fmtCache) this._fmtCache = new Map();
        if (!this._fmtCache.has(moneda)) {
            this._fmtCache.set(moneda, new Intl.NumberFormat('es-AR', { style: 'currency', currency: moneda }));
        }
        return this._fmtCache.get(moneda).format(n || 0);
    }

    /**
     * Rellena `amountEl` con nodos: importe principal como `<span>` y monedas
     * secundarias como `<small>` (más pequeñas, semi-transparentes).
     * ARS se muestra primero (principal); resto como secundarias.
     */
    _buildAmountNodes(amountsMap, colorKey, amountEl) {
        const entries = Object.entries(amountsMap)
            .filter(([, v]) => Number(v) > 0)
            .sort(([a], [b]) => {
                if (a === 'ARS') return -1;
                if (b === 'ARS') return 1;
                return a.localeCompare(b);
            });

        if (entries.length === 0) {
            amountEl.textContent = '—';
            return;
        }

        const [primaryCur, primaryVal] = entries[0];
        const primary = document.createElement('span');
        primary.textContent = this._fmtMoneda(primaryCur, Number(primaryVal));
        amountEl.appendChild(primary);

        for (let i = 1; i < entries.length; i++) {
            const [cur, val] = entries[i];
            const secondary = document.createElement('small');
            secondary.className = `text-${colorKey}-emphasis opacity-75 fw-semibold`;
            secondary.textContent = this._fmtMoneda(cur, Number(val));
            amountEl.appendChild(secondary);
        }
    }

    _render() {
        const pendiente = this._pendiente || {};
        const pagado = this._pagado || {};

        this.innerHTML = '';

        const hasPendiente = Object.values(pendiente).some(v => Number(v) > 0);
        const hasPagado = Object.values(pagado).some(v => Number(v) > 0);

        if (!hasPendiente && !hasPagado) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'row g-3 mt-3';

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
        col.className = 'col-12 col-md-6';

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
        amountEl.className = `fw-bold fs-4 lh-1 text-${colorKey}-emphasis d-flex flex-wrap align-items-baseline gap-2`;
        this._buildAmountNodes(amountsMap, colorKey, amountEl);
        textBlock.appendChild(amountEl);

        if (vencidas > 0) {
            const vencidasEl = document.createElement('div');
            vencidasEl.className = 'small text-danger mt-1';
            const icon = document.createElement('i');
            icon.className = 'bi bi-exclamation-triangle me-1';
            const txt = document.createTextNode(
                `${vencidas} cuota${vencidas !== 1 ? 's' : ''} vencida${vencidas !== 1 ? 's' : ''}`
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
                `${pagadosCount} pago${pagadosCount !== 1 ? 's' : ''} realizado${pagadosCount !== 1 ? 's' : ''}`
            );
            pagadosEl.appendChild(icon);
            pagadosEl.appendChild(txt);
            textBlock.appendChild(pagadosEl);
        }

        body.appendChild(textBlock);

        // Círculo decorativo con ícono a la derecha
        const iconCircle = document.createElement('div');
        iconCircle.className = `d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 bg-${colorKey} bg-opacity-25 p-3`;

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
