// Spec 002 · T03: agregar y descartar un monto nuevo en la lista (criterios 1, 2 y 5).
import { assert, waitFor } from './setup.js';
import '../src/features/deudas/components/DebtForm.js';

function montar(montos = []) {
    const form = document.createElement('debt-form');
    document.body.appendChild(form);
    form.montos = montos;
    form.renderMontosList();
    return form;
}
const filas = (form) => [...form.querySelectorAll('montos-list ul[role="list"] > li')];
const abierto = (form) => form.querySelector('montos-list monto-form');
const agregar = (form) => form.querySelector('#add-monto button');
const campoMonto = (form) => abierto(form).querySelector('[name="monto"]');
const confirmar = (form, vencimiento) => abierto(form).querySelector('app-form').dispatchEvent(new CustomEvent('form:submit', {
    detail: { monto: '500', moneda: 'ARS', vencimiento }, bubbles: true
}));

async function testAbrir() {
    console.log('  Spec 002 C1: "Agregar monto" abre una fila al final, con la lista visible');
    const form = montar([{ monto: 1, moneda: 'ARS', vencimiento: '2026-11-10' }]);
    agregar(form).click();
    assert(filas(form).length === 2 && filas(form)[1].contains(abierto(form)), 'La fila abierta va al final');
    assert(!form.querySelector('#montos-table-wrapper').classList.contains('d-none'), 'La lista sigue visible');
    assert(!form.querySelector('#add-monto-btn-row').classList.contains('d-none'), '"Agregar monto" sigue visible');
    assert(!form.querySelector('#monto-form-title'), 'Sin título "Nuevo monto"');
    assert(document.activeElement === campoMonto(form), 'Foco en el campo "Monto"');
    form.remove();
    const vacia = montar();
    agregar(vacia).click();
    assert(vacia.querySelector('[data-montos-vacio]').hidden && filas(vacia).length === 1, 'Reemplaza al texto de lista vacía');
    vacia.remove();
}

async function testConfirmar() {
    console.log('  Spec 002 C2: "Listo" suma el monto en su lugar, con foco en su ⋮ y anuncio');
    const form = montar([{ monto: 1, moneda: 'ARS', vencimiento: '2026-12-10', pagado: true }]);
    agregar(form).click();
    confirmar(form, '2026-11-10');
    assert(!abierto(form) && form._inlineEditIdx === null, 'La fila se cierra');
    assert(form.montos.length === 2 && form.montos[0].monto === 500, 'Queda primero por su vencimiento');
    assert(form.montos[0].pagado === false, 'No está marcado como pagado');
    assert(document.activeElement === filas(form)[0].querySelector('menu-button').button, 'Foco en su ⋮');
    const anuncio = await waitFor(() => form.querySelector('montos-list [role="status"]').textContent);
    assert(anuncio === 'Monto agregado. Vence el 10 de noviembre de 2026.', 'Anuncia el vencimiento');
    form.remove();
}

async function testDescartar() {
    console.log('  Spec 002 C5: "Cancelar" y Escape descartan la fila, con foco en "Agregar monto"');
    const form = montar();
    agregar(form).click();
    abierto(form).querySelector('#cancelBtn').click();
    assert(!abierto(form) && form.montos.length === 0, '"Cancelar" no agrega nada');
    assert(!form.querySelector('[data-montos-vacio]').hidden, 'Vuelve el texto de lista vacía');
    assert(document.activeElement === agregar(form), 'Foco en "Agregar monto"');
    agregar(form).click();
    let recibido = false;
    form.addEventListener('keydown', () => { recibido = true; });
    campoMonto(form).dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert(!abierto(form) && !recibido, 'Escape cierra la fila y no llega a la ventana');
    assert(document.activeElement === agregar(form), 'Foco en "Agregar monto" tras Escape');
    form.remove();
}

export const tests = [testAbrir, testConfirmar, testDescartar];
