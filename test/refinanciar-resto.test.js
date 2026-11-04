// Spec 004, criterios 11, 14, 15, 16 y 17: lo refinanciado queda fuera del resto de la app.
import { assert } from './setup.js';
import { deleteAllData } from '../src/layout/dataActions.js';
import { progresoCuotas } from '../src/features/deudas/components/AcreedoresList.js';
import { deleteDeudaWithTrackingUseCase } from '../src/features/deudas/use-cases/deleteDeudaWithTrackingUseCase.js';
import { addDeuda, deleteDeudas, getDeuda, updateDeuda } from '../src/features/deudas/deudaRepository.js';
import { deleteMonto, listMontos, setPagado } from '../src/features/montos/montoRepository.js';
import { getMonthlySummary } from '../src/features/stats/statsService.js';
import { deleteAllRefinanciados, listRefinanciados, refinanciarEgreso } from '../src/features/refinanciar/refinanciarRepository.js';

const MES = '2026-11';
const monto = (m, pagado = false) => ({ monto: m, moneda: 'ARS', vencimiento: `${MES}-10`, pagado });
const CUOTAS = Array.from({ length: 12 }, (_, i) => ({ monto: 100, vencimiento: `2027-${String(i + 1).padStart(2, '0')}-10` }));

async function armar(adelanto = null) {
    await deleteDeudas();
    await deleteAllRefinanciados();
    const montos = [monto(1, true), monto(2, true), monto(3, true), monto(5000), monto(5000)];
    const id = await addDeuda({ acreedor: 'Banco', tipoDeuda: 'Préstamo', notas: '', montos });
    await refinanciarEgreso({ deudaId: id, moneda: 'ARS', cuotas: CUOTAS, adelanto, fecha: `${MES}-03` });
    return id;
}

async function criterio14() {
    console.log('  Criterio 14: no aparece en movimientos ni cuenta en los totales');
    await armar();
    const { byCurrency } = await getMonthlySummary(MES);
    assert(byCurrency.egresos.ARS === 6 && byCurrency.pendientes.ARS === 0, 'solo cuentan los pagados del mes');
    const delMes = await listMontos({ mes: MES });
    assert(delMes.length === 3 && delMes.every((m) => m.pagado), 'no está en los movimientos del mes');
}

async function criterio15() {
    console.log('  Criterio 15: el avance dice 4 de 16 con adelanto y 3 de 15 sin adelanto');
    let id = await armar({ monto: 200, fecha: `${MES}-01` });
    assert(progresoCuotas((await getDeuda(id)).montos).texto === '4 de 16 cuotas', 'con adelanto');
    id = await armar();
    assert(progresoCuotas((await getDeuda(id)).montos).texto === '3 de 15 cuotas', 'sin adelanto');
}

async function criterio16() {
    console.log('  Criterio 16: guardar "Editar egreso" los deja como estaban');
    const id = await armar();
    const deuda = await getDeuda(id);
    await updateDeuda({ ...deuda, notas: 'cambio' });
    assert((await listRefinanciados(id)).length === 2, 'siguen los dos');
}

async function criterio11() {
    console.log('  Criterio 11: los montos del plan se usan como cualquier otro');
    const id = await armar();
    const nuevo = (await getDeuda(id)).montos.find((m) => m.vencimiento === '2027-01-10');
    await setPagado(nuevo.id, true);
    assert((await getDeuda(id)).montos.find((m) => m.id === nuevo.id).pagado, 'se marca como pagado');
    await deleteMonto(nuevo.id);
    assert(!(await getDeuda(id)).montos.some((m) => m.id === nuevo.id), 'se elimina');
}

async function criterio17() {
    console.log('  Criterio 17: eliminar el egreso borra sus refinanciados');
    const id = await armar();
    await deleteDeudaWithTrackingUseCase(id);
    assert((await listRefinanciados(id)).length === 0, 'no quedan');
    await armar();
    const confirmar = globalThis.confirm;
    const original = window.setTimeout;
    globalThis.confirm = () => true;
    window.setTimeout = (fn, ms) => (ms === 700 ? 0 : original(fn, ms)); // sin recargar la página
    await deleteAllData();
    window.setTimeout = original;
    globalThis.confirm = confirmar;
    assert((await listRefinanciados()).length === 0, 'eliminar todos los datos también los borra');
}

export const tests = [criterio14, criterio15, criterio16, criterio11, criterio17];
