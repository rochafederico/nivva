// Spec 004, criterio 18: la copia de seguridad conserva lo refinanciado.
import { assert } from './setup.js';
import '../src/features/import-export/components/ImportDataModal.js';
import { mapDeudasParaExportar } from '../src/features/import-export/components/exportarDeudas.js';
import { addDeuda, deleteDeudas, listDeudas } from '../src/features/deudas/deudaRepository.js';
import { deleteAllRefinanciados, listRefinanciados, refinanciarEgreso } from '../src/features/refinanciar/refinanciarRepository.js';

async function limpiar() {
    await deleteDeudas();
    await deleteAllRefinanciados();
}

async function importar(deudas) {
    const modal = document.body.appendChild(document.createElement('import-data-modal'));
    modal.importData = { deudas, ingresos: [] };
    await modal.importDataToDb();
    modal.remove();
}

async function copiaConRefinanciados() {
    await limpiar();
    const montos = [{ monto: 15000, moneda: 'ARS', vencimiento: '2026-05-10', pagado: false }];
    const deudaId = await addDeuda({ acreedor: 'Banco', tipoDeuda: 'Préstamo', notas: '', montos });
    await refinanciarEgreso({ deudaId, moneda: 'ARS', cuotas: [{ monto: 5000, vencimiento: '2026-12-10' }], fecha: '2026-11-03' });
    return JSON.parse(JSON.stringify(mapDeudasParaExportar(await listDeudas(), await listRefinanciados())));
}

async function vuelve() {
    console.log('  Criterio 18: vuelve con los refinanciados, sus fechas y el plan');
    const copia = await copiaConRefinanciados();
    assert(copia[0].refinanciados.length === 1 && !('deudaId' in copia[0].refinanciados[0]), 'la copia los incluye, sin ids internos');
    await limpiar();
    await importar(copia);
    const [egreso] = await listDeudas();
    assert(egreso.montos.length === 1 && egreso.montos[0].monto === 5000, 'vuelve el plan');
    const [viejo] = await listRefinanciados(egreso.id);
    assert(viejo?.monto === 15000 && viejo.vencimiento === '2026-05-10' && viejo.refinanciadoEl === '2026-11-03', 'vuelve con sus fechas');
}

async function noDuplica() {
    console.log('  Criterio 18: importar dos veces no repite los refinanciados');
    const copia = await copiaConRefinanciados();
    await importar(copia);
    assert((await listRefinanciados()).length === 1, 'sigue uno solo');
}

async function copiaVieja() {
    console.log('  Criterio 18: una copia anterior se importa sin error y sin refinanciados');
    await limpiar();
    await importar([{ acreedor: 'Banco', tipoDeuda: 'Préstamo', notas: '', montos: [] }]);
    assert((await listDeudas()).length === 1 && (await listRefinanciados()).length === 0, 'egreso sin refinanciados');
}

export const tests = [vuelve, noDuplica, copiaVieja];
