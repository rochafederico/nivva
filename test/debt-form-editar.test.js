// Spec 002 · T04: editar y descartar un monto en su fila (criterios 3, 4, 6 y 13).
import { assert, waitFor } from './setup.js';
import '../src/features/deudas/components/DebtForm.js';

const noviembre = () => ({ id: 7, monto: 100, moneda: 'ARS', vencimiento: '2026-11-10', pagado: true });
const diciembre = () => ({ monto: 200, moneda: 'USD', vencimiento: '2026-12-10', pagado: false });

function montar(montos) {
    const form = document.createElement('debt-form');
    document.body.appendChild(form);
    form.montos = montos;
    form.renderMontosList();
    return form;
}
const filas = (form) => [...form.querySelectorAll('montos-list ul[role="list"] > li')];
const abierto = (form) => form.querySelector('montos-list monto-form');
const accion = (fila, texto) => {
    const menu = fila.querySelector('menu-button'); menu.open(0);
    [...menu.items].find((item) => item.textContent.trim() === texto).click();
};
const confirmar = (form, vencimiento) => abierto(form).querySelector('app-form').dispatchEvent(new CustomEvent('form:submit', {
    detail: { monto: '150', moneda: 'ARS', vencimiento }, bubbles: true
}));

async function testAbrir() {
    console.log('  Spec 002 C3: "Editar" abre la misma fila con sus valores y la lista visible');
    const form = montar([noviembre(), diciembre()]);
    accion(filas(form)[1], 'Editar');
    assert(filas(form).length === 2 && filas(form)[1].contains(abierto(form)), 'Se abre en su misma fila');
    const campo = abierto(form).querySelector('[name="monto"]');
    assert(campo.value === '200', 'Trae la cifra que tenía');
    assert(abierto(form).querySelector('[name="vencimiento"]').value === '2026-12-10', 'Trae el vencimiento que tenía');
    assert(document.activeElement === campo, 'Foco en el campo "Monto"');
    form.remove();
}

async function testConfirmar() {
    console.log('  Spec 002 C4: "Listo" aplica, reubica, conserva pagado e id, con foco en su ⋮');
    const form = montar([noviembre(), diciembre()]);
    accion(filas(form)[0], 'Editar');
    confirmar(form, '2027-01-05');
    assert(!abierto(form) && form._inlineEditIdx === null, 'La fila se cierra');
    assert(form.montos.length === 2 && form.montos[1].monto === 150, 'Se reubica según su vencimiento');
    assert(form.montos[1].pagado === true && form.montos[1].id === 7, 'Conserva pagado e id');
    assert(document.activeElement === filas(form)[1].querySelector('menu-button').button, 'Foco en su ⋮');
    const anuncio = await waitFor(() => form.querySelector('montos-list [role="status"]').textContent);
    assert(anuncio === 'Monto actualizado.', 'Anuncia la actualización');
    form.remove();
}

async function testDescartar() {
    console.log('  Spec 002 C6: "Cancelar" y Escape dejan los valores de antes, con foco en su ⋮');
    const form = montar([noviembre()]);
    accion(filas(form)[0], 'Editar');
    abierto(form).querySelector('[name="monto"]').value = '999';
    abierto(form).querySelector('#cancelBtn').click();
    assert(!abierto(form) && form.montos[0].monto === 100, '"Cancelar" conserva los valores');
    accion(filas(form)[0], 'Editar');
    let recibido = false;
    form.addEventListener('keydown', () => { recibido = true; });
    abierto(form).querySelector('[name="monto"]').dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert(!abierto(form) && !recibido, 'Escape cierra la fila y no llega a la ventana');
    assert(document.activeElement === filas(form)[0].querySelector('menu-button').button, 'Foco en su ⋮ tras Escape');
    form.remove();
}

async function testEliminarOtro() {
    console.log('  Spec 002 C13: al eliminar otro monto, si tocaba el ⋮ del abierto, foco en su "Monto"');
    const form = montar([noviembre(), diciembre()]);
    accion(filas(form)[1], 'Editar');
    const original = global.confirm;
    global.confirm = () => true;
    accion(filas(form)[0], 'Eliminar');
    global.confirm = original;
    assert(document.activeElement === abierto(form).querySelector('[name="monto"]'), 'Foco en su campo "Monto"');
    form.remove();
}

export const tests = [testAbrir, testConfirmar, testDescartar, testEliminarOtro];
