// Spec 004, criterios 8 y 13 (ajuste #321): cada refinanciación se recuerda y se resume en el detalle.
import { assert } from './setup.js';
import '../src/features/deudas/components/DebtDetailModal.js';
import { addDeuda, deleteDeudas, getDeuda } from '../src/features/deudas/deudaRepository.js';
import { listMontos, setPagado } from '../src/features/montos/montoRepository.js';
import { deleteAllRefinanciaciones, deleteAllRefinanciados, listRefinanciaciones, refinanciarEgreso } from '../src/features/refinanciar/refinanciarRepository.js';
import { textoRefinanciacion } from '../src/features/refinanciar/planCuotas.js';

async function armar() {
    await deleteDeudas();
    await deleteAllRefinanciados();
    await deleteAllRefinanciaciones();
    const montos = [{ monto: 15000, moneda: 'ARS', vencimiento: '2026-05-10' }, { monto: 90, moneda: 'USD', vencimiento: '2026-05-10' }];
    return addDeuda({ acreedor: 'Banco Galicia', tipoDeuda: '', notas: '', montos });
}
const plan = (deudaId, fecha, valores, moneda = 'ARS') =>
    refinanciarEgreso({ deudaId, moneda, fecha, cuotas: valores.map((monto, i) => ({ monto, vencimiento: `2027-0${i + 1}-10` })), adelanto: { monto: 100, fecha } });

async function criterio8() {
    console.log('  Criterio 8: se recuerda el día, la moneda y cada cuota en orden; el adelanto no');
    const id = await armar();
    await plan(id, '2026-06-19', [5000, 4800.5]);
    const [registro] = await listRefinanciaciones(id);
    assert(registro.fecha === '2026-06-19' && registro.moneda === 'ARS', 'día y moneda');
    assert(registro.cuotas.join() === '5000,4800.5', 'las cuotas, en el orden escrito');
    const montos = (await listMontos()).filter((m) => m.deudaId === id);
    assert(montos.length === 4, 'las cuotas y el adelanto siguen siendo montos');
}

function criterio13Textos() {
    console.log('  Criterio 13: "de" si las cuotas son iguales, promedio si no, y una sola cuota sin total');
    const r = (cuotas, moneda = 'ARS') => textoRefinanciacion({ fecha: '2026-06-19', moneda, cuotas });
    assert(r(Array(6).fill(100.12)) === '19/06/2026 · 6 cuotas de $ 100,12 · Total: $ 600,72', 'cuotas iguales');
    assert(r([5000, 5000, 4800.5]) === '19/06/2026 · 3 cuotas, en promedio $ 4.933,50 · Total: $ 14.800,50', 'promedio');
    assert(r([600.72]) === '19/06/2026 · 1 cuota de $ 600,72', 'una cuota');
    assert(r([50, 50], 'USD').includes('de US$ 50,00'), 'con la moneda del plan');
}

async function criterio13Detalle() {
    console.log('  Criterio 13: solo "Refinanciaciones" debajo de Montos; pagar una cuota no cambia la línea');
    const id = await armar();
    await plan(id, '2026-06-19', [100.12, 100.12]);
    await plan(id, '2026-07-01', [45], 'USD');
    const cuota = (await listMontos()).find((m) => m.deudaId === id && !m.pagado);
    await setPagado(cuota.id, true);
    const detalle = document.body.appendChild(document.createElement('debt-detail-modal'));
    await detalle.openDetail(await getDeuda(id));
    const textos = (selector) => [...detalle.ui._bodyEl.querySelectorAll(selector)].map((t) => t.textContent);
    assert(textos('strong').join() === 'Montos,Refinanciaciones', 'debajo de Montos, sin los reemplazados');
    const lineas = textos('ul[aria-label="Refinanciaciones"] li');
    assert(lineas.join('|') === '01/07/2026 · 1 cuota de US$ 45,00|19/06/2026 · 2 cuotas de $ 100,12 · Total: $ 200,24', 'la más reciente primero, sin cambios');
    detalle.remove();
}

export const tests = [criterio8, criterio13Textos, criterio13Detalle];
