// Spec 004, criterios 1 y 2: el botón Refinanciar del detalle.
import { assert, waitFor } from './setup.js';
import '../src/features/deudas/components/DebtDetailModal.js';
import { addDeuda, deleteDeudas, getDeuda } from '../src/features/deudas/deudaRepository.js';
import { deleteAllRefinanciados } from '../src/features/refinanciar/refinanciarRepository.js';

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

export const tests = [criterio1, abreLaVentana];
