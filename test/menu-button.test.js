// test/menu-button.test.js
// Spec 001 · T02: botón de menú "Más acciones" — abrir, elegir, cerrar y anuncios (criterio 8).
import { assert } from './setup.js';
import '../src/shared/components/MenuButton.js';

function crearMenu(parent = document.body) {
    const menu = document.createElement('menu-button');
    menu.label = 'Más acciones';
    menu.accessibleName = 'Más acciones para el monto 1, 15000 pesos';
    menu.options = [{ value: 'duplicar', text: 'Duplicar' }, { value: 'eliminar', text: 'Eliminar' }];
    parent.appendChild(menu);
    return menu;
}

const tecla = (el, key) => el.dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

function testAnunciosCerrado() {
    console.log('  Spec 001 C8: el lector anuncia el botón como menú y su estado');
    const menu = crearMenu();
    const { button } = menu;
    assert(button.textContent === 'Más acciones', 'Texto visible "Más acciones"');
    assert(button.getAttribute('aria-label').startsWith('Más acciones'), 'El nombre empieza con el texto visible');
    assert(button.getAttribute('aria-haspopup') === 'menu', 'Se anuncia como menú');
    assert(button.getAttribute('aria-expanded') === 'false', 'Empieza cerrado');
    assert(document.getElementById(button.getAttribute('aria-controls')) === menu.menu, 'Controla su menú');
    assert(menu.items.map(i => i.getAttribute('role')).join() === 'menuitem,menuitem', 'Opciones como opción de menú');
    assert(menu.items.map(i => i.textContent).join() === 'Duplicar,Eliminar', 'Opciones Duplicar y Eliminar');
    menu.remove();
}

function testClicAbreYElige() {
    console.log('  Spec 001 C8: clic abre con foco en Duplicar y clic en una opción la ejecuta');
    const menu = crearMenu();
    let elegido = null;
    menu.addEventListener('menu:select', e => { elegido = e.detail.value; });
    menu.button.click();
    assert(menu.button.getAttribute('aria-expanded') === 'true', 'Queda abierto');
    assert(menu.menu.classList.contains('show'), 'El menú se ve');
    assert(document.activeElement === menu.items[0], 'Foco en Duplicar');
    menu.items[1].click();
    assert(elegido === 'eliminar', 'Ejecuta Eliminar');
    assert(!menu.isOpen && document.activeElement === menu.button, 'Cierra y vuelve a "Más acciones"');
    menu.remove();
}

function testTeclasEnElMenu() {
    console.log('  Spec 001 C8: Enter y Espacio ejecutan; Escape y Tab cierran');
    const ventana = document.createElement('div');
    document.body.appendChild(ventana);
    const menu = crearMenu(ventana);
    const elegidos = [];
    menu.addEventListener('menu:select', e => elegidos.push(e.detail.value));
    menu.open(0);
    tecla(menu.items[0], 'Enter');
    menu.open(1);
    tecla(menu.items[1], ' ');
    assert(elegidos.join() === 'duplicar,eliminar', 'Enter y Espacio ejecutan la opción');
    let escapeLlegoALaVentana = false;
    ventana.addEventListener('keydown', e => { if (e.key === 'Escape') escapeLlegoALaVentana = true; });
    menu.open(0);
    tecla(menu.items[0], 'Escape');
    assert(!menu.isOpen && document.activeElement === menu.button, 'Escape cierra y vuelve a "Más acciones"');
    assert(!escapeLlegoALaVentana, 'Escape no cierra la ventana del egreso');
    menu.open(0);
    tecla(menu.items[0], 'Tab');
    assert(!menu.isOpen, 'Tab cierra el menú');
    ventana.remove();
}

function testClicAfueraYUnSoloMenu() {
    console.log('  Spec 001 C8: clic afuera cierra sin mover el foco; nunca hay dos menús abiertos');
    const afuera = document.createElement('button');
    document.body.appendChild(afuera);
    const primero = crearMenu();
    const segundo = crearMenu();
    primero.open(0);
    const conFoco = document.activeElement;
    afuera.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    assert(!primero.isOpen, 'Clic afuera cierra');
    assert(document.activeElement === conFoco, 'Clic afuera no mueve el foco');
    primero.open(0);
    segundo.button.click();
    assert(!primero.isOpen && segundo.isOpen, 'Abrir otro menú cierra el primero');
    [afuera, primero, segundo].forEach(el => el.remove());
}

export const tests = [testAnunciosCerrado, testClicAbreYElige, testTeclasEnElMenu, testClicAfueraYUnSoloMenu];
