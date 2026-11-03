// Dibuja las filas de <montos-list> con la fila abierta (spec 002, criterio 13).
// La fila abierta nunca sale del DOM: al reconectarse, monto-form se redibuja y pierde lo escrito.
import { crearFilaMonto } from './MontoRow.js';
import { crearMontoAbierto, numerarMontoAbierto, protegerFocoDelMontoAbierto } from './montoAbierto.js';
import { accionesDe, anunciar } from './montosListaAcciones.js';
import { fechaHablada } from '../utils/montoHablado.js';

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

function confirmarNuevo(lista, datos) {
    const nuevo = { monto: parseFloat(datos.monto), moneda: datos.moneda, vencimiento: datos.vencimiento, pagado: false };
    lista.montos.push(nuevo);
    lista.cerrarMonto('agregado');
    accionesDe(lista, nuevo)?.focus();
    anunciar(lista, `Monto agregado. Vence el ${fechaHablada(nuevo.vencimiento)}.`);
}

// Reemplaza el monto en su lugar del arreglo: conserva si estaba pagado y su id.
function confirmarExistente(lista, datos) {
    const anterior = lista.abierto.monto;
    const actualizado = {
        monto: parseFloat(datos.monto),
        moneda: datos.moneda,
        vencimiento: datos.vencimiento,
        pagado: anterior.pagado ?? false,
        ...(anterior.id !== undefined ? { id: anterior.id } : {})
    };
    lista.montos[lista.montos.indexOf(anterior)] = actualizado;
    lista.cerrarMonto('actualizado');
    accionesDe(lista, actualizado)?.focus();
    anunciar(lista, 'Monto actualizado.');
}

// Antes de abrir otro monto (criterio 12): uno nuevo vacío se descarta; si no, se intenta "Listo".
// Devuelve si se pudo cerrar; si no, la fila queda abierta mostrando sus errores.
export function cerrarAbiertoParaAbrirOtro(lista) {
    if (!lista.abierto) return true;
    const form = lista.abierto.fila.querySelector('app-form');
    const vacio = ['monto', 'moneda', 'vencimiento'].every((nombre) => !form.querySelector(`[name="${nombre}"]`).value);
    if (!lista.abierto.monto && vacio) {
        lista.cerrarMonto();
        return true;
    }
    form.triggerSubmit();
    return !lista.abierto;
}

// Confirmar y descartar la fila abierta.
export function conectarAbierto(lista) {
    lista.lista.addEventListener('monto:save', (e) => {
        e.stopPropagation();
        if (lista.abierto?.monto) confirmarExistente(lista, e.detail);
        else if (lista.abierto) confirmarNuevo(lista, e.detail);
    });
    lista.lista.addEventListener('monto:cancel', (e) => {
        e.stopPropagation();
        const monto = lista.abierto?.monto;
        lista.cerrarMonto(monto ? 'restaurado' : 'descartado');
        if (monto) accionesDe(lista, monto)?.focus();
    });
}
