// test/montos-list-acciones.test.js
// Spec 001 · T06: duplicar y eliminar desde la lista, con foco y anuncios.
import { assert, waitFor } from './setup.js';
import '../src/features/montos/components/MontosList.js';

function montar(montos) {
    const lista = document.createElement('montos-list');
    document.body.appendChild(lista);
    lista.montos = montos;
    return lista;
}

const filas = (lista) => [...lista.lista.children];
const editarDe = (fila) => fila.querySelector('[data-accion="editar"]');
const masAccionesDe = (fila) => fila.querySelector('menu-button').button;
const estado = (lista) => lista.querySelector('[role="status"]');

function elegir(fila, opcion) {
    const menu = fila.querySelector('menu-button');
    menu.open(0);
    menu.items[opcion === 'duplicar' ? 0 : 1].click();
}

async function conConfirm(respuesta, accion) {
    const original = global.confirm;
    const textos = [];
    global.confirm = (texto) => { textos.push(texto); return respuesta; };
    try { await accion(); } finally { global.confirm = original; }
    return textos;
}

async function testDuplicar() {
    console.log('  Spec 001 C6 y C9: duplicar suma el monto del mes siguiente, mueve el foco y anuncia');
    const lista = montar([
        { id: 1, monto: 15000, moneda: 'ARS', vencimiento: '2026-11-10', periodo: '2026-11', pagado: true },
        { id: 2, monto: 15000, moneda: 'ARS', vencimiento: '2026-12-05', periodo: '2026-12', pagado: false }
    ]);
    let duplicado = null;
    lista.addEventListener('montos:duplicated', e => { duplicado = e.detail.monto; });
    elegir(filas(lista)[0], 'duplicar');
    const nuevo = lista.montos[2];
    assert(lista.montos.length === 3 && nuevo.vencimiento === '2027-01-10', 'Monto nuevo que vence el 10/01/2027');
    assert(nuevo.pagado === false && !('periodo' in nuevo), 'Sin pagar y en el mes de su vencimiento');
    assert(duplicado === nuevo, 'Avisa al formulario el monto duplicado');
    assert(document.activeElement === editarDe(filas(lista)[2]), 'Foco en "Editar" del monto nuevo');
    const anuncio = await waitFor(() => estado(lista).textContent);
    assert(anuncio === 'Monto duplicado. Vence el 10 de enero de 2027.', 'Anuncia el vencimiento del nuevo');
    lista.remove();
}

async function testDuplicarFinDeMes() {
    console.log('  Spec 001 C7: duplicar un día 31 con febrero después');
    const lista = montar([{ monto: 500, moneda: 'USD', vencimiento: '2027-01-31', pagado: false }]);
    elegir(filas(lista)[0], 'duplicar');
    assert(lista.montos[1].vencimiento === '2027-02-28', 'Vence el 28/02/2027');
    lista.remove();
}

async function testEliminarAceptando() {
    console.log('  Spec 001 C10 y C11: eliminar pide confirmación, mueve el foco y anuncia');
    const lista = montar([
        { monto: 15000, moneda: 'ARS', vencimiento: '2026-11-10' },
        { monto: 200, moneda: 'USD', vencimiento: '2026-12-10' },
        { monto: 300, moneda: 'ARS', vencimiento: '2027-01-10' }
    ]);
    const textos = await conConfirm(true, () => elegir(filas(lista)[0], 'eliminar'));
    assert(textos[0] === '¿Eliminar el monto de 15000 pesos que vence el 10 de noviembre de 2026?', 'Texto de la confirmación');
    assert(lista.montos.length === 2 && lista.montos[0].monto === 200, 'El monto sale de la lista');
    assert(document.activeElement === editarDe(filas(lista)[0]), 'Foco en "Editar" del monto siguiente');
    assert(await waitFor(() => estado(lista).textContent === 'Monto eliminado.'), 'Anuncia "Monto eliminado."');
    await conConfirm(true, () => elegir(filas(lista)[1], 'eliminar'));
    assert(document.activeElement === editarDe(filas(lista)[0]), 'Sin siguiente, foco en el anterior');
    lista.remove();
}

async function testEliminarCancelando() {
    console.log('  Spec 001 C10: cancelar no cambia nada y vuelve a "Más acciones"');
    const lista = montar([{ monto: 1, moneda: 'ARS', vencimiento: '2026-11-10' }, { monto: 2, moneda: 'ARS', vencimiento: '2026-12-10' }]);
    await conConfirm(false, () => elegir(filas(lista)[1], 'eliminar'));
    assert(lista.montos.length === 2, 'No cambia la lista');
    assert(document.activeElement === masAccionesDe(filas(lista)[1]), 'Foco en "Más acciones" del mismo monto');
    lista.remove();
}

async function testEliminarElUltimo() {
    console.log('  Spec 001 C11: si la lista queda vacía avisa para enfocar "Agregar monto"');
    const lista = montar([{ monto: 1, moneda: 'ARS', vencimiento: '2026-11-10' }]);
    let vacia = false;
    lista.addEventListener('montos:empty', () => { vacia = true; });
    await conConfirm(true, () => elegir(filas(lista)[0], 'eliminar'));
    assert(vacia && lista.montos.length === 0, 'Avisa que la lista quedó vacía');
    lista.remove();
}

export const tests = [testDuplicar, testDuplicarFinDeMes, testEliminarAceptando, testEliminarCancelando, testEliminarElUltimo];
