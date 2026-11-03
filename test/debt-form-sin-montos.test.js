// Spec 002 · T08: botones del pie y mensaje sin montos (criterios 14 y 15).
import { assert } from './setup.js';
import { deleteDeudas, listDeudas } from '../src/features/deudas/deudaRepository.js';
import '../src/features/deudas/components/DebtModal.js';

const MENSAJE = 'Agregá al menos un monto para guardar el egreso.';

function montar({ acreedor = 'Banco' } = {}) {
    const form = document.createElement('debt-form');
    document.body.appendChild(form);
    form.querySelector('[name="acreedor"]').value = acreedor;
    form.querySelector('[name="tipoDeuda"]').value = 'Tarjeta';
    return form;
}
const guardar = (form) => form.querySelector(':scope > app-form').triggerSubmit();
const error = (form) => form.querySelector('#form-error');

async function testPie() {
    console.log('  Spec 002 C14: "Guardar" es el único principal y "Cancelar" es secundario');
    const modal = document.createElement('debt-modal');
    document.body.appendChild(modal);
    await new Promise((resolve) => setTimeout(resolve, 0));
    const botones = [...modal.querySelectorAll('.modal-footer button')];
    const cancelar = botones.find((b) => b.textContent === 'Cancelar');
    const principal = botones.filter((b) => /btn-(primary|success)/.test(b.className));
    assert(cancelar.classList.contains('btn-outline-secondary'), '"Cancelar" tiene borde, sin relleno');
    assert(principal.length === 1 && principal[0].textContent === 'Guardar', '"Guardar" es el único relleno');
    assert(modal.querySelectorAll('button[type="submit"]:not(.d-none)').length === 0, 'No hay otro "Guardar" en la ventana');
    modal.remove();
}

async function testSinMontos() {
    console.log('  Spec 002 C15: sin montos no se guarda, se avisa y el foco va a "Agregar monto"');
    await deleteDeudas();
    const form = montar();
    guardar(form);
    assert(error(form).textContent === MENSAJE && !error(form).classList.contains('d-none'), 'Se lee el mensaje');
    assert(error(form).getAttribute('role') === 'alert', 'El lector lo anuncia');
    assert(document.activeElement === form.querySelector('#add-monto button'), 'Foco en "Agregar monto"');
    assert((await listDeudas()).length === 0, 'No se guarda');
    form.remove();
}

async function testSinMontosNiAcreedor() {
    console.log('  Spec 002 C15: si también falta Acreedor, el foco va a Acreedor');
    const form = montar({ acreedor: '' });
    guardar(form);
    assert(error(form).textContent === MENSAJE, 'Se lee el mensaje');
    assert(document.activeElement === form.querySelector('[name="acreedor"]'), 'Foco en Acreedor');
    form.remove();
}

async function testMensajeSeVa() {
    console.log('  Spec 002 C15: el mensaje se va al agregar un monto');
    const form = montar();
    guardar(form);
    form.openInlineAdd();
    form.querySelector('montos-list monto-form app-form').dispatchEvent(new CustomEvent('form:submit', {
        detail: { monto: '500', moneda: 'ARS', vencimiento: '2026-11-10' }, bubbles: true
    }));
    assert(error(form).classList.contains('d-none') && !error(form).textContent, 'El mensaje se fue');
    form.remove();
}

export const tests = [testPie, testSinMontos, testSinMontosNiAcreedor, testMensajeSeVa];
