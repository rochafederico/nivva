// Spec 002 · T06: "Cancelar" del pie con un monto abierto (criterio 7).
import { assert } from './setup.js';
import { deleteDeudas, listDeudas } from '../src/features/deudas/deudaRepository.js';
import '../src/features/deudas/components/DebtModal.js';

async function testCancelarDelPie() {
    console.log('  Spec 002 C7: "Cancelar" del pie cierra la ventana sin guardar, incluido el monto abierto');
    await deleteDeudas();
    const modal = document.createElement('debt-modal');
    document.body.appendChild(modal);
    await new Promise((resolve) => setTimeout(resolve, 0));
    let cierres = 0;
    modal.ui.close = () => { cierres += 1; };
    const form = modal.querySelector('debt-form');
    form.querySelector('[name="acreedor"]').value = 'Banco';
    form.openInlineAdd();
    form.querySelector('montos-list monto-form [name="monto"]').value = '500';
    const cancelar = [...modal.querySelectorAll('.modal-footer button')].find((b) => b.textContent === 'Cancelar');
    cancelar.click();
    assert(cierres > 0, 'Se cierra la ventana');
    assert(!form.querySelector('montos-list monto-form'), 'No queda ningún monto abierto');
    assert(form.montos.length === 0, 'El monto abierto no se agrega');
    assert((await listDeudas()).length === 0, 'No se guarda nada');
    assert(!form.querySelector('#add-monto-form-container'), 'Sin restos del formulario aparte');
    modal.remove();
}

export const tests = [testCancelarDelPie];
