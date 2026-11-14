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

const filaRefinanciado = (r) => el('li', {
    className: 'list-group-item d-flex justify-content-between gap-2',
    children: [el('span', { className: 'text-nowrap', text: formatMoneda(r.monto, r.moneda) }), el('span', { text: formatFecha(r.vencimiento) })]
});

/** Un grupo por día, el más reciente primero; la fecha va en texto (criterio 13). De solo lectura (criterio 16). */
export function listaRefinanciados(refinanciados) {
    const dias = [...new Set(refinanciados.map(r => r.refinanciadoEl))].sort().reverse();
    const grupos = dias.flatMap(dia => {
        const titulo = `Refinanciado el ${formatFecha(dia)}`;
        const filas = porVencimiento(refinanciados.filter(r => r.refinanciadoEl === dia)).map(filaRefinanciado);
        return [el('h3', { className: 'h6 small text-body-secondary mt-2 mb-1', text: titulo }), el('ul', { className: 'list-group', attrs: { 'aria-label': titulo }, children: filas })];
    });
    const seccion = el('strong', { className: 'mb-2 d-block', text: 'Refinanciados' });
    return el('div', { className: 'mt-3', children: [seccion, ...grupos] });
}
