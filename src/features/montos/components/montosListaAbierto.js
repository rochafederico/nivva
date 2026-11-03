// Dibuja las filas de <montos-list> con la fila abierta (spec 002, criterio 13).
// La fila abierta nunca sale del DOM: al reconectarse, monto-form se redibuja y pierde lo escrito.
import { crearFilaMonto } from './MontoRow.js';
import { crearMontoAbierto, numerarMontoAbierto, protegerFocoDelMontoAbierto } from './montoAbierto.js';

export const crearAbierto = (monto) => ({ monto, fila: crearMontoAbierto(monto) });

function filasEnOrden(lista, abierto) {
    const filas = lista.montos.map((monto, i) => {
        if (monto !== abierto?.monto) return crearFilaMonto(monto, i + 1);
        numerarMontoAbierto(abierto.fila, i + 1);
        return abierto.fila;
    });
    if (abierto && !abierto.monto) {
        numerarMontoAbierto(abierto.fila, 'nuevo');
        filas.push(abierto.fila);
    }
    return filas;
}

// Ubica las demás filas alrededor de la abierta, sin moverla.
function ubicarAlrededor(ul, filas, abierta) {
    const estaba = ul.contains(abierta);
    if (!estaba) ul.appendChild(abierta);
    [...ul.children].forEach((hijo) => { if (hijo !== abierta) hijo.remove(); });
    let antes = true;
    filas.forEach((fila) => {
        if (fila === abierta) antes = false;
        else if (antes) ul.insertBefore(fila, abierta);
        else ul.appendChild(fila);
    });
    if (!estaba) protegerFocoDelMontoAbierto(abierta);
}

export function dibujarFilas(lista, abierto) {
    const filas = filasEnOrden(lista, abierto);
    if (abierto) ubicarAlrededor(lista.lista, filas, abierto.fila);
    else lista.lista.replaceChildren(...filas);
}
