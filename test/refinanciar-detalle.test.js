// Spec 004, criterios 1, 2, 13 y 16: botón del detalle y lista de refinanciados.
import { assert, waitFor } from './setup.js';
import '../src/features/deudas/components/DebtDetailModal.js';
import { addDeuda, deleteDeudas, getDeuda } from '../src/features/deudas/deudaRepository.js';
import { deleteAllRefinanciados, refinanciarEgreso } from '../src/features/refinanciar/refinanciarRepository.js';

const CUOTA = { monto: 5000, vencimiento: '2026-12-10' };

async function armar(pagado = false) {
    await deleteDeudas();
    await deleteAllRefinanciados();
    const montos = [{ monto: 15000, moneda: 'ARS', vencimiento: '2026-05-10', pagado }];
    const id = await addDeuda({ acreedor: 'Banco Galicia', tipoDeuda: '', notas: '', montos });
    const detalle = document.body.appendChild(document.createElement('debt-detail-modal'));
    return { id, detalle };
}
const botones = (detalle) => [...detalle.ui._bodyEl.querySelectorAll('button')].map((b) => b.textContent);

async function criterio1() {
    console.log('  Criterios 1 y 2: el botón aparece solo con montos sin pagar');
    let { id, detalle } = await armar();
    await detalle.openDetail(await getDeuda(id));
    assert(botones(detalle).join() === 'Editar,Refinanciar,Cerrar', 'junto a Editar y Cerrar');
    const boton = [...detalle.ui._bodyEl.querySelectorAll('button')].find((b) => b.textContent === 'Refinanciar');
    assert(boton.getAttribute('aria-label') === 'Refinanciar Banco Galicia', 'se anuncia con el acreedor');
    detalle.remove();
    ({ id, detalle } = await armar(true));
    await detalle.openDetail(await getDeuda(id));
    assert(botones(detalle).join() === 'Editar,Cerrar', 'pagado: sin Refinanciar');
    detalle.remove();
}

async function criterio13() {
    console.log('  Criterios 13 y 16: Refinanciados debajo de Montos, de solo lectura');
    const { id, detalle } = await armar();
    await refinanciarEgreso({ deudaId: id, moneda: 'ARS', cuotas: [CUOTA], fecha: '2026-11-03' });
    await detalle.openDetail(await getDeuda(id));
    const titulos = [...detalle.ui._bodyEl.querySelectorAll('strong')].map((t) => t.textContent);
    assert(titulos.join() === 'Montos,Refinanciados', 'debajo de Montos');
    const fila = detalle.ui._bodyEl.querySelector('ul li');
    assert(fila.textContent.includes('$ 15.000,00') && fila.textContent.includes('10/05/2026'), 'monto y vencimiento');
    assert(fila.textContent.includes('Refinanciado el 03/11/2026'), 'la fecha va en texto');
    assert(!fila.querySelector('button, input'), 'no se puede tocar');
    detalle.remove();
}

async function abreLaVentana() {
    console.log('  Criterio 1: el botón cierra el detalle, abre la ventana y conserva a quién volver');
    const { id, detalle } = await armar();
    const opener = document.body.appendChild(document.createElement('button'));
    await detalle.openDetail(await getDeuda(id));
    detalle.attachOpener(opener);
    [...detalle.ui._bodyEl.querySelectorAll('button')].find((b) => b.textContent === 'Refinanciar').click();
    await waitFor(() => document.querySelector('refinanciar-modal')?.opener === opener);
    assert(document.querySelector('refinanciar-modal').opener === opener, 'la ventana vuelve a la fila que abrió el detalle');
    document.querySelector('refinanciar-modal').ui.close();
    detalle.remove();
    opener.remove();
}

export const tests = [criterio1, criterio13, abreLaVentana];
