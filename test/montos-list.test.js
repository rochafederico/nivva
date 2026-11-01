// test/montos-list.test.js
// Spec 001 · T05: lista "Montos" — orden, texto de orden, anuncio como lista, vacío y sin scroll.
import { assert } from './setup.js';
import '../src/features/montos/components/MontosList.js';

function montar(montos) {
    const nombre = document.createElement('div');
    nombre.id = 'montos-label';
    nombre.textContent = 'Montos';
    const lista = document.createElement('montos-list');
    lista.setAttribute('labelledby', 'montos-label');
    document.body.append(nombre, lista);
    lista.montos = montos;
    return { lista, quitar: () => { nombre.remove(); lista.remove(); } };
}

const montosDePrueba = () => [
    { monto: 300, moneda: 'ARS', vencimiento: '2026-12-10', pagado: false },
    { monto: 100, moneda: 'ARS', vencimiento: '2026-10-10', pagado: false },
    { monto: 200, moneda: 'USD', vencimiento: '2026-11-10', pagado: true }
];

function testListaLlamadaMontos() {
    console.log('  Spec 001 C1: lista "Montos" ordenada del vencimiento más antiguo al más reciente');
    const { lista, quitar } = montar(montosDePrueba());
    const ul = lista.querySelector('ul');
    const orden = lista.querySelector(`#${ul.getAttribute('aria-describedby')}`);
    assert(ul.getAttribute('role') === 'list', 'Se anuncia como lista aunque no tenga viñetas');
    assert(document.getElementById(ul.getAttribute('aria-labelledby')).textContent === 'Montos', 'Se llama "Montos"');
    assert(orden.textContent === 'Del vencimiento más antiguo al más reciente.', 'Texto de orden');
    assert(!orden.hidden, 'El texto de orden se ve');
    assert(ul.children.length === 3, 'Una fila por monto (el lector cuenta los elementos)');
    const cifras = [...ul.querySelectorAll('li .fw-semibold [aria-hidden="true"]')].map(n => n.textContent);
    assert(cifras.join('|') === '$ 100,00|US$ 200,00|$ 300,00', 'Ordenada por vencimiento');
    assert(ul.children[2].querySelector('[data-accion="editar"]').getAttribute('aria-label') ===
        'Editar monto 3, 300 pesos', 'La posición sigue el orden de la lista');
    quitar();
}

function testListaVacia() {
    console.log('  Spec 001 C12: sin montos se ve el mensaje en lugar de la lista');
    const { lista, quitar } = montar([]);
    const vacio = lista.querySelector('[data-montos-vacio]');
    assert(!vacio.hidden, 'Se ve el mensaje');
    assert(vacio.textContent === 'Todavía no agregaste montos. Agregá el primero.', 'Texto del mensaje');
    assert(lista.querySelector('ul').hidden, 'No se ve la lista');
    assert(lista.querySelector(`#${lista.querySelector('ul').getAttribute('aria-describedby')}`).hidden,
        'No se ve el texto de orden');
    lista.montos = montosDePrueba();
    assert(vacio.hidden && !lista.querySelector('ul').hidden, 'Con montos vuelve la lista');
    quitar();
}

function testSinScrollPropio() {
    console.log('  Spec 001 C13: la lista no tiene scroll propio');
    const muchos = Array.from({ length: 30 }, (_, i) =>
        ({ monto: i + 1, moneda: 'ARS', vencimiento: `2027-01-${String((i % 28) + 1).padStart(2, '0')}` }));
    const { lista, quitar } = montar(muchos);
    const conScroll = [lista, ...lista.querySelectorAll('*')].filter(el =>
        /overflow|max-height/.test(el.getAttribute('style') || '') || /overflow-(auto|scroll)/.test(el.className));
    assert(conScroll.length === 0, 'Ningún elemento con overflow o altura máxima');
    assert(!lista.querySelector('[tabindex="0"]'), 'No hay zona de scroll enfocable');
    quitar();
}

function testEditarAvisaAlFormulario() {
    console.log('  Spec 001 C5: Editar en una fila avisa con el monto y su posición');
    const montos = montosDePrueba();
    const { lista, quitar } = montar(montos);
    let aviso = null;
    lista.addEventListener('montos:edit', e => { aviso = e.detail; });
    lista.querySelectorAll('[data-accion="editar"]')[1].click();
    assert(aviso && aviso.monto.monto === 200 && aviso.idx === 1, 'Avisa el monto 2 de la lista');
    assert(lista.querySelector('[role="status"]'), 'Tiene una región para anuncios desde el inicio');
    quitar();
}

export const tests = [testListaLlamadaMontos, testListaVacia, testSinScrollPropio, testEditarAvisaAlFormulario];
