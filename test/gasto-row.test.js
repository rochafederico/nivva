// Spec 003, criterios 7, 8, 13 y 17: la fila del gasto en la lista del mes.
import { assert, waitFor } from './setup.js';
import '../src/features/deudas/components/DebtList.js';
import { createGastoRow } from '../src/features/gastos/components/GastoRow.js';
import { filasDelMes } from '../src/features/deudas/components/filasDelMes.js';
import { addGasto, deleteAllGastos } from '../src/features/gastos/gastoRepository.js';
import { getSelectedMonth } from '../src/shared/MonthFilter.js';

const SUPER = { id: 1, descripcion: 'Súper', monto: 5000, moneda: 'ARS', fecha: '2026-11-03' };

async function criterio7() {
    console.log('  Criterio 7: texto de la fila y orden a igual fecha');
    const fila = createGastoRow(SUPER);
    const visible = [...fila.querySelectorAll('[aria-hidden="true"]')].map((el) => el.textContent);
    assert(visible.includes('Gasto · 03/11/2026'), 'tipo y fecha en texto');
    assert(visible.includes('$ 5.000,00'), 'monto en pesos');
    const enDolares = createGastoRow({ ...SUPER, moneda: 'USD' });
    assert(enDolares.textContent.includes('US$ 5.000,00'), 'monto en dólares');
    const fecha = '2026-11-03';
    const orden = filasDelMes({
        gastos: [{ fecha }, { fecha: '2026-11-01' }], montos: [{ vencimiento: fecha }], ingresos: [{ fecha }],
    }).map((f) => f._kind || 'monto');
    assert(orden.join() === 'gasto,ingreso,monto,gasto', 'por fecha; a igual fecha ingresos, montos y gastos');
}

async function criterio8y17() {
    console.log('  Criterios 8 y 17: sin interruptor, con menú y forma hablada');
    const fila = createGastoRow(SUPER);
    assert(!fila.querySelector('[role="switch"]'), 'no tiene interruptor de pagado');
    const menu = fila.querySelector('menu-button');
    assert(menu.options.map((o) => o.text).join() === 'Editar,Eliminar', 'menú con Editar y Eliminar');
    assert(menu.button.getAttribute('aria-label') === 'Acciones del gasto Súper, 5000 pesos', 'nombre del botón ⋮');
    const hablado = [...fila.querySelectorAll('.visually-hidden')].map((el) => el.textContent);
    assert(hablado.includes('Gasto, 3 de noviembre de 2026') && hablado.includes('5000 pesos'), 'el lector oye la forma hablada');
    let avisado = null;
    fila.addEventListener('gasto:delete', (e) => { avisado = e.detail.gasto; });
    menu.dispatchEvent(new CustomEvent('menu:select', { detail: { value: 'delete' } }));
    assert(avisado === SUPER, 'el menú avisa qué gasto');
}

async function lista(atributos) {
    const el = document.createElement('debt-list');
    Object.entries(atributos).forEach(([k, v]) => el.setAttribute(k, v));
    document.body.appendChild(el);
    await waitFor(() => el.querySelector('tbody tr'));
    return el;
}

async function criterio13() {
    console.log('  Criterios 7 y 13: se ve en Todo y Egresos, no en pendientes');
    await deleteAllGastos();
    await addGasto({ ...SUPER, id: undefined, fecha: `${getSelectedMonth()}-15` });
    const todo = await lista({ 'include-ingresos': '' });
    assert(await waitFor(() => todo.querySelector('[data-gasto-id]')), 'aparece en Todo');
    const egresos = await lista({});
    assert(await waitFor(() => egresos.querySelector('[data-gasto-id]')), 'aparece en Egresos');
    const pendientes = await lista({ estado: 'pendiente' });
    assert(!pendientes.querySelector('[data-gasto-id]'), 'no aparece en montos pendientes');
    [todo, egresos, pendientes].forEach((el) => el.remove());
    await deleteAllGastos();
}

export const tests = [criterio7, criterio8y17, criterio13];
