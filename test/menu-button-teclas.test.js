// test/menu-button-teclas.test.js
// Spec 001 · T03: botón de menú con flechas, vuelta en las puntas, Inicio y Fin (criterio 8).
import { assert } from './setup.js';
import '../src/shared/components/MenuButton.js';

function crearMenu() {
    const menu = document.createElement('menu-button');
    menu.label = 'Más acciones';
    menu.options = [{ value: 'duplicar', text: 'Duplicar' }, { value: 'eliminar', text: 'Eliminar' }];
    document.body.appendChild(menu);
    return menu;
}

function tecla(el, key) {
    const evento = new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    el.dispatchEvent(evento);
    return evento;
}

function testFlechasAbren() {
    console.log('  Spec 001 C8: flecha abajo abre en Duplicar y flecha arriba en Eliminar');
    const menu = crearMenu();
    const abajo = tecla(menu.button, 'ArrowDown');
    assert(menu.isOpen && document.activeElement === menu.items[0], 'Flecha abajo: foco en Duplicar');
    assert(abajo.defaultPrevented, 'Flecha abajo no hace scroll');
    menu.close();
    tecla(menu.button, 'ArrowUp');
    assert(menu.isOpen && document.activeElement === menu.items[1], 'Flecha arriba: foco en Eliminar');
    menu.close();
    tecla(menu.button, 'a');
    assert(!menu.isOpen, 'Otra tecla no abre el menú');
    menu.remove();
}

function testFlechasRecorrenYDanLaVuelta() {
    console.log('  Spec 001 C8: con el menú abierto, las flechas pasan de opción y dan la vuelta');
    const menu = crearMenu();
    menu.open(0);
    const [duplicar, eliminar] = menu.items;
    tecla(duplicar, 'ArrowDown');
    assert(document.activeElement === eliminar, 'Flecha abajo: de Duplicar a Eliminar');
    tecla(eliminar, 'ArrowDown');
    assert(document.activeElement === duplicar, 'Flecha abajo en la última vuelve a la primera');
    tecla(duplicar, 'ArrowUp');
    assert(document.activeElement === eliminar, 'Flecha arriba en la primera va a la última');
    tecla(eliminar, 'ArrowUp');
    assert(document.activeElement === duplicar, 'Flecha arriba: de Eliminar a Duplicar');
    assert(menu.isOpen, 'Moverse no cierra el menú');
    menu.remove();
}

function testInicioYFin() {
    console.log('  Spec 001 C8: Inicio va a la primera opción y Fin a la última');
    const menu = crearMenu();
    menu.open(0);
    const [duplicar, eliminar] = menu.items;
    tecla(duplicar, 'End');
    assert(document.activeElement === eliminar, 'Fin: Eliminar');
    tecla(eliminar, 'Home');
    assert(document.activeElement === duplicar, 'Inicio: Duplicar');
    menu.remove();
}

function testEnterYEscapeSiguen() {
    console.log('  Spec 001 C8: Enter ejecuta y Escape cierra después de moverse');
    const menu = crearMenu();
    let elegido = null;
    menu.addEventListener('menu:select', e => { elegido = e.detail.value; });
    tecla(menu.button, 'ArrowDown');
    tecla(menu.items[0], 'ArrowDown');
    tecla(menu.items[1], 'Enter');
    assert(elegido === 'eliminar' && !menu.isOpen, 'Enter ejecuta la opción con foco');
    tecla(menu.button, 'ArrowUp');
    tecla(menu.items[1], 'Escape');
    assert(!menu.isOpen && document.activeElement === menu.button, 'Escape vuelve a "Más acciones"');
    menu.remove();
}

export const tests = [testFlechasAbren, testFlechasRecorrenYDanLaVuelta, testInicioYFin, testEnterYEscapeSiguen];
