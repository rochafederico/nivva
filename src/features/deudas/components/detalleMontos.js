// Sección "Montos" del detalle del egreso.
import { el } from '../../../shared/utils/dom.js';
import { formatMoneda } from '../../../shared/config/monedas.js';

const porVencimiento = (lista) => lista.slice().sort((a, b) => (a.vencimiento || '').localeCompare(b.vencimiento || ''));

function filaMonto(monto) {
    return el('tr', {
        children: [
            el('td', { text: formatMoneda(monto.monto, monto.moneda) }),
            el('td', { text: monto.moneda }),
            el('td', { text: monto.vencimiento || '—' })
        ]
    });
}

export function seccionMontos(montos) {
    const thead = el('thead', {
        children: [el('tr', {
            children: [el('th', { text: 'Monto' }), el('th', { text: 'Moneda' }), el('th', { text: 'Vencimiento' })]
        })]
    });
    const tbody = el('tbody', { attrs: { id: 'detail-montos-tbody' } });
    porVencimiento(montos).forEach(monto => tbody.appendChild(filaMonto(monto)));
    return el('div', {
        children: [
            el('strong', { className: 'mb-2 d-block', text: 'Montos' }),
            el('div', {
                className: 'overflow-auto',
                style: 'max-height: 260px;',
                children: [el('table', { className: 'table table-sm w-100', children: [thead, tbody] })]
            })
        ]
    });
}
