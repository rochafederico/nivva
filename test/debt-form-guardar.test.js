// Spec 002 · T07: "Guardar" del egreso con un monto abierto (criterios 9, 10 y 11).
import { assert, waitFor } from './setup.js';
import { deleteDeudas, listDeudas } from '../src/features/deudas/deudaRepository.js';
import '../src/features/deudas/components/DebtForm.js';

function montar({ acreedor = 'Banco', tipo = 'Tarjeta' } = {}) {
    const form = document.createElement('debt-form');
    document.body.appendChild(form);
    form.querySelector('[name="acreedor"]').value = acreedor;
    form.querySelector('[name="tipoDeuda"]').value = tipo;
    form.openInlineAdd();
    return form;
}
const campo = (form, nombre) => form.querySelector(`montos-list monto-form [name="${nombre}"]`);
const guardar = (form) => form.querySelector(':scope > app-form').triggerSubmit();
function completar(form) {
    campo(form, 'monto').value = '500';
    campo(form, 'moneda').value = 'ARS';
    campo(form, 'vencimiento').value = '2026-11-10';
    // happy-dom no da por válido este formulario; la validación real se prueba con los casos incompletos.
    campo(form, 'monto').form.noValidate = true;
}

async function testCompletoSeGuarda() {
    console.log('  Spec 002 C9: el monto abierto completo se incluye y el egreso se guarda');
    await deleteDeudas();
    const form = montar();
    completar(form);
    let guardado = false;
    form.addEventListener('deuda:saved', () => { guardado = true; });
    guardar(form);
    await waitFor(() => guardado);
    const deudas = await listDeudas();
    assert(deudas.length === 1 && deudas[0].acreedor === 'Banco', 'Se guarda el egreso');
    form.remove();
    await deleteDeudas();
}

async function testCompletoSinAcreedor() {
    console.log('  Spec 002 C9: sin Acreedor no se guarda, el monto se incluye y el foco va a Acreedor');
    await deleteDeudas();
    const form = montar({ acreedor: '' });
    completar(form);
    guardar(form);
    assert(form.montos.length === 1 && !form.montosList.abierto, 'El monto queda incluido');
    assert(document.activeElement === form.querySelector('[name="acreedor"]'), 'Foco en Acreedor');
    assert(form.querySelector('[data-debt-form-field="acreedor"]').classList.contains('was-validated'), 'Marca Acreedor');
    assert((await listDeudas()).length === 0, 'No se guarda');
    form.remove();
}

async function testIncompleto() {
    console.log('  Spec 002 C10 y C11: con el monto incompleto no se guarda y se ven sus errores');
    await deleteDeudas();
    const form = montar();
    guardar(form);
    assert(form.montosList.abierto, 'La fila sigue abierta');
    assert(campo(form, 'monto').getAttribute('aria-invalid') === 'true', 'Muestra sus errores');
    assert(document.activeElement === campo(form, 'monto'), 'Foco en su primer campo con problema');
    assert((await listDeudas()).length === 0, 'No se guarda');
    form.remove();
    const sinAcreedor = montar({ acreedor: '' });
    guardar(sinAcreedor);
    assert(document.activeElement === sinAcreedor.querySelector('[name="acreedor"]'), 'Foco en el primero de la ventana');
    assert(campo(sinAcreedor, 'monto').getAttribute('aria-invalid') === 'true', 'También marca el monto');
    sinAcreedor.remove();
}

export const tests = [testCompletoSeGuarda, testCompletoSinAcreedor, testIncompleto];
