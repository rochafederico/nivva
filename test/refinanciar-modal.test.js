// Spec 004, criterios 7 a 10 y 12, y escenario de error: confirmar, guardar, mensaje y foco.
import { assert, waitFor } from './setup.js';
import { abrirRefinanciar } from '../src/features/refinanciar/components/abrirRefinanciar.js';
import { getDB } from '../src/shared/database/initDB.js';
import { addDeuda, deleteDeudas, getDeuda } from '../src/features/deudas/deudaRepository.js';
import { deleteAllRefinanciados } from '../src/features/refinanciar/refinanciarRepository.js';

const VALORES = { cuotas: '5000, 5000, 4800.50', primerVencimiento: '2026-12-10', adelanto: '', fechaAdelanto: '2026-11-04' };
const avisos = [];
window.addEventListener('app:notify', (e) => avisos.push(e.detail.message));

async function armar(aceptar = true) {
    await deleteDeudas();
    await deleteAllRefinanciados();
    avisos.length = 0;
    const montos = [15000, 15000, 15000].map((monto) => ({ monto, moneda: 'ARS', vencimiento: '2026-11-10', pagado: false }));
    const id = await addDeuda({ acreedor: 'Banco Galicia', tipoDeuda: '', notas: '', montos });
    const opener = document.body.appendChild(document.createElement('button'));
    await abrirRefinanciar(await getDeuda(id), opener);
    const preguntas = [];
    globalThis.confirm = (texto) => { preguntas.push(texto); return aceptar; };
    const modal = document.querySelector('refinanciar-modal');
    const enviar = (valores = VALORES) => modal.form.form.dispatchEvent(new CustomEvent('form:submit', { detail: valores }));
    return { id, opener, modal, preguntas, enviar };
}

async function criterio7() {
    console.log('  Criterio 7: si se cancela la confirmación, no cambia nada');
    const { id, opener, modal, preguntas, enviar } = await armar(false);
    enviar();
    assert(preguntas[0] === '¿Refinanciar 3 montos de Banco Galicia por 3 cuotas, con un total de 14800,50 pesos? No se puede deshacer.', 'texto de la spec');
    enviar({ ...VALORES, adelanto: '20000' });
    assert(preguntas[1].endsWith('pesos? Adelanto: 20000 pesos. No se puede deshacer.'), 'con adelanto');
    assert((await getDeuda(id)).montos.length === 3 && avisos.length === 0, 'no guarda');
    modal.ui.close();
    opener.remove();
}

async function criterio10() {
    console.log('  Criterios 8 y 10: guarda, avisa y devuelve el foco');
    const { id, opener, enviar } = await armar();
    enviar();
    enviar();
    await waitFor(() => avisos.length === 1);
    assert(avisos[0] === 'Refinanciación guardada. 3 cuotas, la primera vence el 10 de diciembre de 2026.', 'mensaje de la spec');
    assert((await getDeuda(id)).montos.map((m) => m.vencimiento).join() === '2026-12-10,2027-01-10,2027-02-10', 'plan mensual, guardado una sola vez');
    assert(document.activeElement === opener, 'el foco vuelve a donde se abrió');
    opener.remove();
}

async function criterio9() {
    console.log('  Criterios 9 y 10: el adelanto queda pagado y va en el mensaje');
    const { id, opener, enviar } = await armar();
    enviar({ ...VALORES, adelanto: '20000' });
    await waitFor(() => avisos.length === 1);
    assert(avisos[0] === 'Refinanciación guardada. Adelanto de 20000 pesos y 3 cuotas, la primera vence el 10 de diciembre de 2026.', 'mensaje con adelanto');
    assert((await getDeuda(id)).montos.filter((m) => m.pagado).length === 1, 'adelanto pagado');
    opener.remove();
}

async function focoSinOpener() {
    console.log('  Criterio 10: si la lista se dibujó de nuevo, va al control con el mismo nombre');
    const { opener, enviar } = await armar();
    opener.setAttribute('aria-label', 'Más acciones para Banco Galicia');
    const nuevo = document.createElement('button');
    nuevo.setAttribute('aria-label', 'Más acciones para Banco Galicia');
    const redibujar = () => { opener.remove(); document.body.appendChild(nuevo); };
    window.addEventListener('deuda:updated', redibujar, { once: true });
    enviar();
    await waitFor(() => document.activeElement === nuevo);
    assert(document.activeElement === nuevo, 'el foco va al botón nuevo');
    nuevo.remove();
}

async function errorAlGuardar() {
    console.log('  Error al guardar: la ventana sigue abierta con lo escrito');
    const { id, opener, modal, enviar } = await armar();
    const { transaction } = getDB();
    getDB().transaction = () => { throw new Error('sin lugar'); };
    enviar();
    await waitFor(() => !modal.error.classList.contains('d-none'));
    getDB().transaction = transaction;
    assert(modal.error.textContent === 'No pudimos guardar la refinanciación. Intentá de nuevo.' && avisos.length === 0, 'muestra el error');
    assert((await getDeuda(id)).montos.length === 3, 'no cambia ningún monto');
    modal.ui.close();
    opener.remove();
}

export const tests = [criterio7, criterio10, criterio9, focoSinOpener, errorAlGuardar];
