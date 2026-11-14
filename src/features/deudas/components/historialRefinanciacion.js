// Lo que el detalle del egreso muestra debajo de "Montos" cuando hubo refinanciaciones (criterio 13).
// Los montos reemplazados no se muestran: quedan como historial.
import { el } from '../../../shared/utils/dom.js';
import { listRefinanciaciones } from '../../refinanciar/refinanciarRepository.js';
import { textoRefinanciacion } from '../../refinanciar/planCuotas.js';

/** Una línea por refinanciación, la más reciente primero. */
export function listaRefinanciaciones(refinanciaciones) {
    const orden = refinanciaciones.slice().sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);
    const filas = orden.map((r) => el('li', { className: 'list-group-item', text: textoRefinanciacion(r) }));
    return el('div', {
        className: 'mt-3',
        children: [
            el('strong', { className: 'mb-2 d-block', text: 'Refinanciaciones' }),
            el('ul', { className: 'list-group', attrs: { 'aria-label': 'Refinanciaciones' }, children: filas })
        ]
    });
}

export async function historialRefinanciacion(deudaId) {
    const refinanciaciones = await listRefinanciaciones(deudaId);
    return refinanciaciones.length ? [listaRefinanciaciones(refinanciaciones)] : [];
}
