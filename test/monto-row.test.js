// test/monto-row.test.js
// Spec 001 · T04 y T08: fila de un monto — cifra, vencimiento, interruptor "Pagado" y menú ⋮.
import { assert } from './setup.js';
import { crearFilaMonto } from '../src/features/montos/components/MontoRow.js';

const peso = { monto: 15000, moneda: 'ARS', vencimiento: '2026-11-10', pagado: false };

function montar(monto, posicion = 3) {
    const lista = document.createElement('ul');
    const fila = crearFilaMonto(monto, posicion);
    lista.appendChild(fila);
    document.body.appendChild(lista);
    return fila;
}

const visible = (el) => [...el.querySelectorAll('[aria-hidden="true"]')].map(n => n.textContent);
const hablado = (el) => [...el.querySelectorAll('.visually-hidden')].map(n => n.textContent);

function testCifraYVencimientoVisibles() {
    console.log('  Spec 001 C2: la fila muestra la cifra y el vencimiento con formato');
    const fila = montar(peso);
    assert(fila.tagName === 'LI', 'Cada monto es un elemento de la lista');
    assert(visible(fila).includes('$ 15.000,00'), 'Muestra $ 15.000,00');
    assert(visible(fila).includes('Vence el 10/11/2026'), 'Muestra Vence el 10/11/2026');
    assert(!fila.textContent.includes('ARS'), 'La moneda no se muestra aparte');
    fila.parentNode.remove();
    const dolar = montar({ ...peso, moneda: 'USD' });
    assert(visible(dolar).includes('US$ 15.000,00'), 'En dólares muestra US$ 15.000,00');
    dolar.parentNode.remove();
}

function testFormaHablada() {
    console.log('  Spec 001 C3: el lector lee el monto y el vencimiento en la forma hablada');
    const fila = montar(peso);
    assert(hablado(fila).includes('15000 pesos'), 'Dice 15000 pesos');
    assert(hablado(fila).includes('Vence el 10 de noviembre de 2026'), 'Dice la fecha completa');
    fila.parentNode.remove();
}

function testInterruptorPagado() {
    console.log('  Spec 001 C4: interruptor "Pagado" con etiqueta visible, única indicación del estado');
    const monto = { ...peso, pagado: true };
    const fila = montar(monto);
    const casilla = fila.querySelector('input[type="checkbox"]');
    const etiqueta = fila.querySelector(`label[for="${casilla.id}"]`);
    assert(casilla.getAttribute('role') === 'switch', 'El lector lo anuncia como interruptor');
    assert(casilla.closest('.form-switch'), 'Mismo aspecto que el del listado de egresos');
    assert(casilla.checked, 'Activado si el monto está pagado');
    assert(etiqueta && etiqueta.textContent.startsWith('Pagado'), 'Etiqueta visible "Pagado"');
    assert(!/Pendiente/.test(fila.textContent), 'No hay texto "Pendiente"');
    assert(fila.textContent.split('Pagado').length === 2, 'No hay otro texto "Pagado"');
    casilla.focus();
    casilla.click();
    assert(monto.pagado === false, 'Al cambiarla cambia el estado del monto');
    assert(document.activeElement === casilla && casilla.isConnected, 'El foco sigue en el interruptor');
    fila.parentNode.remove();
}

function testNombresDeLosControles() {
    console.log('  Spec 001 C14: nombres que empiezan con el texto visible');
    const fila = montar(peso, 3);
    const casilla = fila.querySelector('input[type="checkbox"]');
    const etiqueta = fila.querySelector(`label[for="${casilla.id}"]`);
    const menu = fila.querySelector('menu-button');
    assert(!fila.querySelector('[data-accion="editar"]'), 'No hay botón "Editar" aparte');
    assert(menu.button.textContent === '⋮', 'Botón ⋮ sin texto visible');
    assert(menu.button.getAttribute('aria-label') === 'Acciones del monto 3, 15000 pesos', 'Acciones del monto 3, 15000 pesos');
    assert(!menu.menu.hasAttribute('aria-label') && menu.menu.getAttribute('aria-labelledby') === menu.button.id,
        'El menú se llama como el botón: el lector no lee los tres puntos');
    assert(etiqueta.textContent === 'Pagado: monto 3, 15000 pesos', 'Pagado: monto 3, 15000 pesos');
    assert(menu.items.map(i => i.textContent).join() === 'Editar,Duplicar,Eliminar', 'Menú con Editar, Duplicar y Eliminar');
    fila.parentNode.remove();
}

function testAcciones() {
    console.log('  Spec 001 C5 y C8: las opciones del menú ⋮ avisan a la lista');
    const fila = montar(peso);
    const avisos = [];
    ['monto:edit', 'monto:duplicate', 'monto:delete'].forEach(tipo =>
        fila.parentNode.addEventListener(tipo, e => avisos.push(`${tipo}:${e.detail.monto === peso}`)));
    const menu = fila.querySelector('menu-button');
    [0, 1, 2].forEach((i) => { menu.open(0); menu.items[i].click(); });
    assert(avisos.join() === 'monto:edit:true,monto:duplicate:true,monto:delete:true', 'Editar, Duplicar y Eliminar');
    fila.parentNode.remove();
}

export const tests = [testCifraYVencimientoVisibles, testFormaHablada, testInterruptorPagado, testNombresDeLosControles, testAcciones];
