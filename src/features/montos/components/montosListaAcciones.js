// src/features/montos/components/montosListaAcciones.js
// Duplicar y eliminar desde <montos-list> (spec 001, criterios 6, 7, 9, 10 y 11):
// cambia el arreglo de montos, vuelve a dibujar, mueve el foco y anuncia sin mover el foco.
import { duplicarMonto } from '../utils/duplicarMonto.js';
import { montoHablado, fechaHablada } from '../utils/montoHablado.js';

const editarDe = (lista, monto) =>
    lista.lista.children[lista.montos.indexOf(monto)]?.querySelector('[data-accion="editar"]');

// Se vacía y se escribe después, para que el lector anuncie aunque el texto se repita.
function anunciar(lista, texto) {
    const estado = lista.querySelector('[role="status"]');
    estado.textContent = '';
    setTimeout(() => { estado.textContent = texto; }, 50);
}

function duplicar(lista, monto) {
    const nuevo = duplicarMonto(monto, lista.montos);
    lista.montos.push(nuevo);
    lista.render();
    editarDe(lista, nuevo)?.focus();
    anunciar(lista, `Monto duplicado. Vence el ${fechaHablada(nuevo.vencimiento)}.`);
    lista.dispatchEvent(new CustomEvent('montos:duplicated', { detail: { monto: nuevo }, bubbles: true }));
}

function eliminar(lista, monto, fila) {
    const texto = `¿Eliminar el monto de ${montoHablado(monto.monto, monto.moneda)} ` +
        `que vence el ${fechaHablada(monto.vencimiento)}?`;
    if (!confirm(texto)) {
        fila.querySelector('menu-button')?.button.focus();
        return;
    }
    const idx = lista.montos.indexOf(monto);
    lista.montos.splice(idx, 1);
    lista.render();
    const vecino = lista.montos[idx] || lista.montos[idx - 1];
    if (vecino) {
        editarDe(lista, vecino)?.focus();
    } else {
        lista.dispatchEvent(new CustomEvent('montos:empty', { bubbles: true }));
    }
    anunciar(lista, 'Monto eliminado.');
}

/**
 * Escucha los avisos de las filas de una <montos-list>.
 * @param {import('./MontosList.js').MontosList} lista
 */
export function conectarAcciones(lista) {
    lista.lista.addEventListener('monto:duplicate', (e) => {
        e.stopPropagation();
        duplicar(lista, e.detail.monto);
    });
    lista.lista.addEventListener('monto:delete', (e) => {
        e.stopPropagation();
        eliminar(lista, e.detail.monto, e.target.closest('li'));
    });
}
