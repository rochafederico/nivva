// Spec 004, criterios 1, 2, 13 y 16: botón del detalle y lista de refinanciados.
import { assert, waitFor } from './setup.js';
import '../src/features/deudas/components/DebtDetailModal.js';
import { addDeuda, deleteDeudas, getDeuda } from '../src/features/deudas/deudaRepository.js';
import { deleteAllRefinanciados, refinanciarEgreso } from '../src/features/refinanciar/refinanciarRepository.js';

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

async function criterio13Grupos() {
    console.log('  Criterios 13 y 16: Refinanciados debajo de Montos, por día y de solo lectura');
    const { id, detalle } = await armar();
    const plan = (fecha, ...vencimientos) => refinanciarEgreso({ deudaId: id, moneda: 'ARS', fecha, cuotas: vencimientos.map((vencimiento) => ({ monto: 5000, vencimiento })) });
    await plan('2026-11-03', '2026-12-10', '2027-01-10');
    await plan('2026-11-05', '2027-02-10');
    await plan('2026-11-05', '2027-03-10');
    await detalle.openDetail(await getDeuda(id));
    const textos = (selector) => [...detalle.ui._bodyEl.querySelectorAll(selector)].map((t) => t.textContent);
    assert(textos('strong').join() === 'Montos,Refinanciados', 'debajo de Montos');
    const titulos = textos('h3');
    assert(titulos.join() === 'Refinanciado el 05/11/2026,Refinanciado el 03/11/2026', 'por día, el más reciente primero');
    const listas = [...detalle.ui._bodyEl.querySelectorAll('ul')];
    assert(listas[0].getAttribute('aria-label') === titulos[0], 'cada lista se anuncia con su fecha');
    assert(listas[0].children.length === 3 && listas[1].children.length === 1, 'el mismo día queda en un grupo');
    assert(listas[1].firstChild.textContent === '$ 15.000,00' + '10/05/2026' && !listas[1].querySelector('button, input'), 'monto, vencimiento y nada que tocar');
    assert(textos('ul:first-of-type li span:last-child').join() === '10/12/2026,10/01/2027,10/02/2027', 'por vencimiento dentro del grupo');
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

export const tests = [criterio1, criterio13Grupos, abreLaVentana];
