// Spec 003, criterios 9, 10, 11 y 21: editar y eliminar con su foco y anuncios.
import { assert, waitFor } from './setup.js';
import '../src/features/deudas/components/DebtList.js';
import '../src/features/gastos/components/GastoModal.js';
import { addGasto, deleteAllGastos, getAll } from '../src/features/gastos/gastoRepository.js';
import { fechaHablada } from '../src/features/montos/utils/montoHablado.js';
import { getSelectedMonth } from '../src/shared/MonthFilter.js';

const avisos = [];
window.addEventListener('app:notify', (e) => avisos.push(e.detail.message));
const fecha = () => `${getSelectedMonth()}-15`;
const boton = (lista, id) => lista.querySelector(`[data-gasto-id="${id}"] menu-button button`);
const elegir = (lista, id, value) => lista.querySelector(`[data-gasto-id="${id}"] menu-button`)
    .dispatchEvent(new CustomEvent('menu:select', { detail: { value } }));

async function armar(descripciones) {
    await deleteAllGastos();
    avisos.length = 0;
    const ids = [];
    for (const descripcion of descripciones) ids.push(await addGasto({ descripcion, monto: 5000, moneda: 'ARS', fecha: fecha() }));
    const fab = document.body.appendChild(document.createElement('button'));
    fab.id = 'add-fab';
    const modal = document.body.appendChild(document.createElement('gasto-modal'));
    modal.id = 'gastoModal';
    const lista = document.body.appendChild(document.createElement('debt-list'));
    await waitFor(() => lista.querySelectorAll('[data-gasto-id]').length === ids.length);
    return { ids, fab, modal, lista, fin: () => { fab.remove(); modal.remove(); lista.remove(); } };
}

async function criterio9() {
    console.log('  Criterios 9 y 21: editar actualiza la fila y devuelve el foco');
    const { ids: [id], fab, modal, lista, fin } = await armar(['Súper']);
    elegir(lista, id, 'edit');
    assert(await waitFor(() => modal.ui._modalEl.querySelector('.modal-title').textContent === 'Editar gasto'), 'título Editar gasto');
    assert(modal.ui._modalEl.querySelector('button[type="submit"]').textContent === 'Guardar cambios', 'botón Guardar cambios');
    assert(modal.ui._modalEl.querySelector('[name="descripcion"]').value === 'Súper', 'trae sus datos');
    assert(!modal.ui._modalEl.querySelector('[name="tipo"]'), 'no se puede cambiar el tipo');
    const enviar = (detail) => modal.form.form.dispatchEvent(new CustomEvent('form:submit', { detail }));
    enviar({ descripcion: 'Verdulería', monto: '10', moneda: 'ARS', fecha: fecha() });
    await waitFor(() => document.activeElement === boton(lista, id) && lista.textContent.includes('Verdulería'));
    assert(lista.textContent.includes('Verdulería') && (await getAll()).length === 1, 'la fila se actualiza');
    assert(document.activeElement === boton(lista, id), 'el foco va a su ⋮');
    assert(avisos.at(-1) === 'Gasto actualizado.', 'anuncio');

    elegir(lista, id, 'edit');
    enviar({ descripcion: 'Verdulería', monto: '10', moneda: 'ARS', fecha: '2020-10-05' });
    await waitFor(() => document.activeElement === fab);
    assert(document.activeElement === fab, 'si cambia de mes, el foco va al botón +');
    assert(avisos.at(-1) === 'Gasto actualizado en octubre de 2020.', 'dice dónde quedó');
    fin();
}

async function criterios10y11() {
    console.log('  Criterios 10 y 11: eliminar confirma y pasa el foco');
    const { ids: [a, b], fab, lista, fin } = await armar(['Súper', 'Taxi']);
    const original = globalThis.confirm;
    let pregunta = '';
    let respuesta = false;
    globalThis.confirm = (t) => { pregunta = t; return respuesta; };
    elegir(lista, a, 'delete');
    assert(pregunta === `¿Eliminar el gasto "Súper" de 5000 pesos del ${fechaHablada(fecha())}?`, 'texto de la confirmación');
    await waitFor(() => document.activeElement === boton(lista, a));
    assert(document.activeElement === boton(lista, a) && (await getAll()).length === 2, 'cancelar no cambia nada');

    respuesta = true;
    elegir(lista, a, 'delete');
    await waitFor(() => !boton(lista, a) && document.activeElement === boton(lista, b));
    assert(document.activeElement === boton(lista, b), 'el foco pasa a la fila siguiente');
    assert(avisos.at(-1) === 'Gasto eliminado.', 'anuncio');
    elegir(lista, b, 'delete');
    await waitFor(() => document.activeElement === fab);
    assert(document.activeElement === fab, 'sin filas, el foco va al botón +');
    globalThis.confirm = original;
    fin();
}

export const tests = [criterio9, criterios10y11];
