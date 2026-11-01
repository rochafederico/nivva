// test/debt-form-montos.test.js
// Spec 001 · T07: la lista "Montos" dentro de "Agregar egreso" y "Editar egreso".
import { assert } from './setup.js';
import { deleteDeudas } from '../src/features/deudas/deudaRepository.js';
import { listMontos } from '../src/features/montos/montoRepository.js';
import '../src/features/deudas/components/DebtForm.js';

const datosEgreso = { acreedor: 'Banco Spec 001', tipoDeuda: 'Tarjeta', notas: '' };

function nuevoFormulario(montos) {
    const form = document.createElement('debt-form');
    document.body.appendChild(form);
    form.montos = montos;
    form.renderMontosList();
    return form;
}

const filas = (form) => [...form.querySelectorAll('montos-list li')];

function elegir(fila, indice) {
    const menu = fila.querySelector('menu-button'); menu.open(0); menu.items[indice].click();
}

async function testListaEnAgregarYEditar() {
    console.log('  Spec 001 C1 y C13: la lista reemplaza a la tabla en Agregar y en Editar egreso');
    const form = nuevoFormulario([{ monto: 100, moneda: 'ARS', vencimiento: '2026-11-10', pagado: false }]);
    assert(!form.querySelector('table'), 'Ya no hay tabla de montos');
    assert(form.querySelector('montos-list ul').getAttribute('aria-labelledby') === 'montos-label', 'Se llama "Montos"');
    assert(filas(form).length === 1, 'Agregar egreso: una fila por monto');
    assert(!form.querySelector('#montos-table-wrapper .overflow-auto, [style*="max-height"]'), 'Sin scroll propio');
    form.load({ id: 99, acreedor: 'X', tipoDeuda: 'Y', notas: '', montos: [{ id: 1, monto: 1, moneda: 'ARS',
        vencimiento: '2026-12-10' }, { id: 2, monto: 2, moneda: 'USD', vencimiento: '2026-11-10', pagado: true }] });
    assert(filas(form).length === 2, 'Editar egreso: muestra los montos del egreso');
    assert(form.montos[0].id === 2, 'Ordenados del vencimiento más antiguo al más reciente');
    form.remove();
}

async function testEditarAbreLaEdicion() {
    console.log('  Spec 001 C5: "Editar" abre la edición de ese monto, como antes');
    const form = nuevoFormulario([{ monto: 1, moneda: 'ARS', vencimiento: '2026-11-10' }, { monto: 2, moneda: 'ARS', vencimiento: '2026-12-10' }]);
    filas(form)[1].querySelector('[data-accion="editar"]').click();
    assert(form._amountMode === 'editing' && form._inlineEditRef === form.montos[1], 'Edita el monto 2');
    assert(form.querySelector('#add-monto-form-container monto-form'), 'Se abre el formulario del monto');
    assert(form.querySelector('#montos-table-wrapper').classList.contains('d-none'), 'La lista se oculta mientras tanto');
    form.remove();
}

async function testPagadoYDuplicadoAlGuardar() {
    console.log('  Spec 001 C4 y C6: "Pagado" y el duplicado quedan así al guardar el egreso');
    await deleteDeudas();
    const form = nuevoFormulario([{ monto: 15000, moneda: 'ARS', vencimiento: '2026-11-10', pagado: false },
        { monto: 15000, moneda: 'ARS', vencimiento: '2026-12-05', pagado: false }]);
    filas(form)[0].querySelector('input[type="checkbox"]').click();
    elegir(filas(form)[0], 0);
    await form.handleSubmit({ preventDefault: () => {}, detail: datosEgreso });
    const noviembre = await listMontos({ mes: '2026-11' });
    const enero = await listMontos({ mes: '2027-01' });
    assert(noviembre.length === 1 && noviembre[0].pagado === true, 'El monto de noviembre se guarda pagado');
    assert(enero.length === 1 && enero[0].vencimiento === '2027-01-10' && !enero[0].pagado, 'Duplicado en enero de 2027');
    form.remove();
    await deleteDeudas();
}

async function testEliminarElUltimoEnfocaAgregar() {
    console.log('  Spec 001 C11: al eliminar el único monto, el foco pasa a "Agregar monto"');
    const form = nuevoFormulario([{ monto: 1, moneda: 'ARS', vencimiento: '2026-11-10' }]);
    const original = global.confirm;
    global.confirm = () => true;
    elegir(filas(form)[0], 1);
    global.confirm = original;
    assert(form.montos.length === 0, 'La lista queda vacía');
    assert(document.activeElement === form.querySelector('#add-monto button'), 'Foco en "Agregar monto"');
    form.remove();
}

export const tests = [testListaEnAgregarYEditar, testEditarAbreLaEdicion, testPagadoYDuplicadoAlGuardar, testEliminarElUltimoEnfocaAgregar];
