// Spec 002 · T02: la lista dibuja una fila abierta y no pierde lo escrito (criterio 13).
import { assert } from './setup.js';
import '../src/features/montos/components/MontosList.js';

const venc = (vencimiento, id) => ({ id, monto: id * 100, moneda: 'ARS', vencimiento, pagado: false });
function montar(montos = [venc('2026-11-10', 1), venc('2026-12-10', 2), venc('2027-02-10', 3)]) {
    const lista = document.createElement('montos-list');
    document.body.appendChild(lista);
    lista.montos = montos;
    return lista;
}
const filas = (lista) => [...lista.lista.children];
const grupo = (lista) => lista.querySelector('[role="group"]');
const campo = (lista, nombre = 'monto') => lista.querySelector(`monto-form [name="${nombre}"]`);
const listo = (lista) => lista.querySelector('button[type="submit"]').getAttribute('aria-label');
function elegir(fila, texto) {
    const menu = fila.querySelector('menu-button');
    menu.open(0);
    menu.items.find((item) => item.textContent.trim() === texto).click();
}

async function testFilaEnSuLugar() {
    console.log('  Spec 002 T02: un monto existente se abre en su lugar y uno nuevo al final');
    const lista = montar();
    lista.abrirMonto(lista.montos[1]);
    assert(filas(lista).length === 3 && filas(lista)[1].contains(grupo(lista)), 'El monto 2 se abre en su lugar');
    assert(grupo(lista).getAttribute('aria-label') === 'Monto 2' && listo(lista) === 'Listo, monto 2', 'Nombres del monto 2');
    assert(campo(lista).value === '200', 'Muestra la cifra que tenía');
    assert(campo(lista).getAttribute('style')?.includes('scroll-margin-block'), 'El foco no queda tapado');
    lista.abrirMonto();
    assert(lista.querySelectorAll('[role="group"]').length === 1, 'Nunca hay dos filas abiertas');
    assert(filas(lista).length === 4 && filas(lista)[3].contains(grupo(lista)), 'Un monto nuevo va al final');
    assert(grupo(lista).getAttribute('aria-label') === 'Monto nuevo', 'El grupo se llama "Monto nuevo"');
    assert(lista.montos.length === 3, 'Un monto nuevo no entra en el arreglo');
    lista.cerrarMonto();
    assert(!grupo(lista) && filas(lista).length === 3, 'Al cerrarla quedan las filas cerradas');
    lista.remove();
}

async function testListaVacia() {
    console.log('  Spec 002 C1: en una lista vacía la fila abierta reemplaza al texto');
    const lista = montar([]);
    lista.abrirMonto();
    assert(!lista.lista.hidden && lista.querySelector('[data-montos-vacio]').hidden, 'Se ve la fila y no el texto');
    lista.cerrarMonto();
    assert(lista.lista.hidden && !lista.querySelector('[data-montos-vacio]').hidden, 'Al cerrarla vuelve el texto');
    lista.remove();
}

async function testConservaLoEscrito() {
    console.log('  Spec 002 C13: interruptor, Duplicar y Eliminar de otro monto no pierden lo escrito');
    const lista = montar();
    lista.abrirMonto(lista.montos[2]);
    campo(lista).value = '999';
    filas(lista)[0].querySelector('input[type="checkbox"]').click();
    assert(lista.montos[0].pagado === true, 'El interruptor marca el otro monto');
    elegir(filas(lista)[0], 'Duplicar');
    assert(campo(lista).value === '999', 'Duplicar no pierde lo escrito');
    const original = global.confirm;
    global.confirm = () => true;
    elegir(filas(lista)[0], 'Eliminar');
    global.confirm = original;
    assert(campo(lista).value === '999', 'Eliminar no pierde lo escrito');
    const numero = filas(lista).findIndex((fila) => fila.contains(grupo(lista))) + 1;
    assert(grupo(lista).getAttribute('aria-label') === `Monto ${numero}`, 'El grupo sigue su posición');
    assert(listo(lista) === `Listo, monto ${numero}`, '"Listo" sigue su posición');
    lista.remove();
}

async function testDuplicadoNoCuentaLoEscrito() {
    console.log('  Spec 002 C13: para el duplicado no cuenta el monto nuevo ni lo escrito en uno existente');
    for (const abrir of [(lista) => lista.abrirMonto(), (lista) => lista.abrirMonto(lista.montos[2])]) {
        const lista = montar();
        abrir(lista);
        campo(lista, 'vencimiento').value = '2027-08-10';
        elegir(filas(lista)[0], 'Duplicar');
        assert(lista.montos.at(-1).vencimiento === '2027-03-10', 'Vence el mes siguiente al último cerrado');
        lista.remove();
    }
}

async function testEscapeNoSaleDeLaFila() {
    console.log('  Spec 002 T02: Escape en la fila abierta no llega a la ventana');
    const lista = montar();
    let recibido = false;
    lista.addEventListener('keydown', () => { recibido = true; });
    lista.abrirMonto(lista.montos[0]);
    campo(lista).dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert(!recibido, 'El evento se detiene en la fila');
    lista.remove();
}

export const tests = [testFilaEnSuLugar, testListaVacia, testConservaLoEscrito, testDuplicadoNoCuentaLoEscrito, testEscapeNoSaleDeLaFila];
