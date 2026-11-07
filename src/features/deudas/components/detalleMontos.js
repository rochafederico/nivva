// Secciones del detalle del egreso: los montos vigentes y los refinanciados.
import { el } from '../../../shared/utils/dom.js';
import { formatMoneda } from '../../../shared/config/monedas.js';
import { formatFecha } from '../../../shared/utils/fechas.js';

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

/** Se distinguen por el texto, no por el color (criterio 13). Son de solo lectura (criterio 16). */
export function listaRefinanciados(refinanciados) {
    const filas = porVencimiento(refinanciados).map(r => el('li', {
        className: 'list-group-item',
        children: [
            el('div', {
                className: 'd-flex justify-content-between gap-2',
                children: [el('span', { className: 'text-nowrap', text: formatMoneda(r.monto, r.moneda) }), el('span', { text: formatFecha(r.vencimiento) })]
            }),
            el('div', { className: 'small text-body-secondary', text: `Refinanciado el ${formatFecha(r.refinanciadoEl)}` })
        ]
    }));
    return el('div', {
        className: 'mt-3',
        children: [
            el('strong', { className: 'mb-2 d-block', text: 'Refinanciados' }),
            el('ul', { className: 'list-group', attrs: { 'aria-label': 'Refinanciados' }, children: filas })
        ]
    });
}
