// src/features/montos/components/MontoRow.js
// Fila de un monto en la lista "Montos" (spec 001): cifra y vencimiento visibles y hablados,
// casilla "Pagado", botón "Editar" y menú "Más acciones" (Duplicar, Eliminar).
// La fila avisa con 'monto:edit', 'monto:duplicate' y 'monto:delete' (detail.monto).
import { formatMoneda } from '../../../shared/config/monedas.js';
import { formatFecha } from '../../../shared/utils/fechas.js';
import { montoHablado, fechaHablada } from '../utils/montoHablado.js';
import '../../../shared/components/MenuButton.js';

let contador = 0;
// Que el foco no quede debajo del encabezado ni del pie de la ventana del egreso.
const MARGEN_FOCO = 'scroll-margin-block: 5rem;';

function nodo(tag, className, texto) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (texto !== undefined) el.textContent = texto;
    return el;
}

// Texto visible para la vista y otro para el lector de pantalla.
function dobleTexto(className, visibleText, habladoText) {
    const contenedor = nodo('div', className);
    const visible = nodo('span', '', visibleText);
    visible.setAttribute('aria-hidden', 'true');
    contenedor.append(visible, nodo('span', 'visually-hidden', habladoText));
    return contenedor;
}

function casillaPagado(monto, referencia) {
    const id = `monto-pagado-${++contador}`;
    const contenedor = nodo('div', 'form-check mb-0');
    const casilla = nodo('input', 'form-check-input');
    casilla.type = 'checkbox';
    casilla.id = id;
    casilla.checked = !!monto.pagado;
    casilla.style.cssText = MARGEN_FOCO;
    casilla.addEventListener('change', () => { monto.pagado = casilla.checked; });
    const etiqueta = nodo('label', 'form-check-label', 'Pagado');
    etiqueta.htmlFor = id;
    etiqueta.appendChild(nodo('span', 'visually-hidden', `: ${referencia}`));
    contenedor.append(casilla, etiqueta);
    return contenedor;
}

/**
 * @param {Object} monto Monto de la lista ({ monto, moneda, vencimiento, pagado }).
 * @param {number} posicion Posición en la lista, empezando en 1.
 * @returns {HTMLLIElement}
 */
export function crearFilaMonto(monto, posicion) {
    const cifraHablada = montoHablado(monto.monto, monto.moneda);
    const referencia = `monto ${posicion}, ${cifraHablada}`;
    const avisar = (tipo) => fila.dispatchEvent(new CustomEvent(tipo, { detail: { monto }, bubbles: true }));

    const fila = nodo('li', 'border rounded p-2 mb-2 d-flex flex-wrap align-items-center gap-2');
    const datos = nodo('div', 'me-auto');
    datos.append(
        dobleTexto('fw-semibold', formatMoneda(monto.monto, monto.moneda), cifraHablada),
        dobleTexto('small text-body-secondary', `Vence el ${formatFecha(monto.vencimiento)}`,
            `Vence el ${fechaHablada(monto.vencimiento)}`)
    );

    const editar = nodo('button', 'btn btn-outline-primary btn-sm', 'Editar');
    editar.type = 'button';
    editar.dataset.accion = 'editar';
    editar.setAttribute('aria-label', `Editar ${referencia}`);
    editar.style.cssText = MARGEN_FOCO;
    editar.addEventListener('click', () => avisar('monto:edit'));

    const menu = document.createElement('menu-button');
    menu.label = 'Más acciones';
    menu.accessibleName = `Más acciones para el ${referencia}`;
    menu.options = [{ value: 'duplicar', text: 'Duplicar' }, { value: 'eliminar', text: 'Eliminar' }];
    menu.render();
    menu.button.style.cssText = MARGEN_FOCO;
    menu.addEventListener('menu:select', (e) => {
        e.stopPropagation();
        avisar(e.detail.value === 'duplicar' ? 'monto:duplicate' : 'monto:delete');
    });

    const acciones = nodo('div', 'd-flex gap-2');
    acciones.append(editar, menu);
    fila.append(datos, casillaPagado(monto, referencia), acciones);
    return fila;
}
