// Spec 004, criterios 1, 2, 3 y 19: Refinanciar en Acreedores y la ventana.
import { assert, waitFor } from './setup.js';
import '../src/features/deudas/components/AcreedoresList.js';
import { addDeuda, deleteDeudas } from '../src/features/deudas/deudaRepository.js';

const m = (monto, pagado = false) => ({ monto, moneda: 'ARS', vencimiento: '2026-11-10', pagado });

async function armar(montos) {
    await deleteDeudas();
    await addDeuda({ acreedor: 'Banco Galicia', tipoDeuda: 'Préstamo', notas: '', montos });
    const lista = document.body.appendChild(document.createElement('acreedores-list'));
    await waitFor(() => lista.querySelector('tr[data-row-id]'));
    return lista;
}

const opciones = (lista) => [...lista.querySelectorAll('.dropdown-item')].map((b) => b.textContent.trim()).join();

async function menu() {
    console.log('  Criterios 1 y 2: Refinanciar entre Editar y Eliminar, solo con montos sin pagar');
    let lista = await armar([m(15000)]);
    assert(opciones(lista) === 'Editar,Refinanciar,Eliminar', 'orden del menú');
    assert(lista.querySelector('[data-refinanciar-id]').getAttribute('aria-label') === 'Refinanciar Banco Galicia', 'se anuncia con el acreedor');
    lista.remove();
    lista = await armar([m(15000, true)]);
    assert(opciones(lista) === 'Editar,Eliminar', 'pagado: solo Editar y Eliminar');
    lista.remove();
}

async function ventana() {
    console.log('  Criterios 3 y 19: dice qué se reemplaza; Cancelar cierra y devuelve el foco');
    const lista = await armar([m(15000), m(15000), m(15000), m(5, true)]);
    const boton = lista.querySelector('.acreedor-menu-btn');
    lista.querySelector('[data-refinanciar-id]').click();
    await waitFor(() => document.querySelector('refinanciar-modal')?.form?.deuda);
    const modal = document.querySelector('refinanciar-modal');
    assert(modal.ui._titleEl.textContent === 'Refinanciar egreso', 'título');
    assert(modal.form.acreedor.textContent === 'Banco Galicia', 'muestra el acreedor');
    assert(modal.form.resumen.textContent === 'Vas a reemplazar 3 montos sin pagar: $ 45.000,00', 'resumen');
    assert(modal.form.querySelector('button[type="submit"]').getAttribute('aria-label') === 'Refinanciar Banco Galicia', 'el botón dice qué egreso');
    modal.form.querySelector('#cancelBtn').click();
    await waitFor(() => document.activeElement === boton);
    assert(document.activeElement === boton, 'el foco vuelve al menú ⋮');
    lista.remove();
}

export const tests = [menu, ventana];
