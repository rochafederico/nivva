// Spec 003, criterios 3, 4 y 6: guardar, mensajes, cancelar, error al guardar y título anunciado.
import { assert, waitFor } from './setup.js';
import '../src/features/gastos/components/GastoModal.js';
import '../src/shared/components/AppToast.js';
import { getDB } from '../src/shared/database/initDB.js';
import { deleteAllGastos, getAll } from '../src/features/gastos/gastoRepository.js';
import { getSelectedMonth } from '../src/shared/MonthFilter.js';

const avisos = [];
window.addEventListener('app:notify', (e) => avisos.push(e.detail.message));
window.addEventListener('gasto:saved', (e) => avisos.push(e.detail.foco));

const llenar = (modal, fecha = `${getSelectedMonth()}-15`) => modal.form.form.dispatchEvent(new CustomEvent('form:submit', {
    detail: { descripcion: 'Súper', monto: '5000', moneda: 'ARS', fecha },
}));

async function armar() {
    await deleteAllGastos();
    avisos.length = 0;
    const opener = document.body.appendChild(document.createElement('button'));
    const modal = document.body.appendChild(document.createElement('gasto-modal'));
    await modal.openCreate(opener);
    return { modal, opener, fin: () => { modal.remove(); opener.remove(); } };
}

async function criterio3() {
    console.log('  Criterio 3: guarda, cierra, vuelve el foco y anuncia');
    const { modal, opener, fin } = await armar();
    const toast = document.body.appendChild(document.createElement('app-toast'));
    llenar(modal);
    await waitFor(() => avisos.length === 2);
    assert((await getAll()).length === 1, 'se guarda');
    assert(avisos.join() === 'agregar,Gasto agregado.', 'al cerrarse emite el evento con el foco y el mensaje');
    assert(document.activeElement === opener, 'el foco vuelve al botón +');
    assert(document.querySelector('[role="status"].visually-hidden').textContent === 'Gasto agregado.', 'la región lo lee sin mover el foco');
    toast.remove();
    fin();
}

async function criterio4() {
    console.log('  Criterio 4: con fecha de otro mes, dice dónde quedó');
    const { modal, fin } = await armar();
    llenar(modal, '2020-10-05');
    await waitFor(() => avisos.length === 2);
    assert(avisos[1] === 'Gasto agregado en octubre de 2020.', 'el mensaje indica el mes');
    fin();
}

async function criterio6() {
    console.log('  Criterio 6: Cancelar cierra sin guardar y devuelve el foco');
    const { modal, opener, fin } = await armar();
    modal.form.form.querySelector('#cancelBtn').click();
    await waitFor(() => document.activeElement === opener);
    assert(document.activeElement === opener, 'el foco vuelve a donde estaba');
    assert((await getAll()).length === 0 && avisos.length === 0, 'no guarda ni avisa');
    fin();
}

async function errorAlGuardar() {
    console.log('  Error al guardar: la ventana sigue abierta');
    const { modal, fin } = await armar();
    const { transaction } = getDB();
    getDB().transaction = () => { throw new Error('sin lugar'); };
    llenar(modal);
    await waitFor(() => !modal.error.classList.contains('d-none'));
    getDB().transaction = transaction;
    assert(!modal.error.classList.contains('d-none') && avisos.length === 0, 'muestra el error y no avisa');
    fin();
}

async function tituloAnunciado() {
    console.log('  El diálogo apunta a su propio título');
    const { modal, fin } = await armar();
    const titulo = modal.ui._modalEl.querySelector('.modal-title');
    assert(titulo.textContent === 'Agregar gasto', 'título de la spec');
    assert(modal.ui._modalEl.getAttribute('aria-labelledby') === titulo.id && titulo.id !== 'modal-title', 'id único');
    fin();
}

export const tests = [criterio3, criterio4, criterio6, errorAlGuardar, tituloAnunciado];
