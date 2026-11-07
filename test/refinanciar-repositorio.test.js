// Spec 004, criterios 8, 9 y 12, y escenario de error: refinanciar en una transacción.
import { assert } from './setup.js';
import { getDB, initDB } from '../src/shared/database/initDB.js';
import { DB_NAME, DEUDAS_STORE, MONTOS_STORE, VERSION } from '../src/shared/database/schema.js';
import { FakeIDB } from '../src/shared/database/localStorageFallback.js';
import { addDeuda, deleteDeudas, getDeuda } from '../src/features/deudas/deudaRepository.js';
import { deleteAllRefinanciados, listRefinanciados, refinanciarEgreso } from '../src/features/refinanciar/refinanciarRepository.js';

const CUOTAS = [{ monto: 5000, vencimiento: '2026-12-10' }, { monto: 4800.5, vencimiento: '2027-01-10' }];
const espera = (req) => new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
});

async function armar() {
    await deleteDeudas();
    await deleteAllRefinanciados();
    return addDeuda({
        acreedor: 'Banco Galicia', tipoDeuda: 'Préstamo', notas: '',
        montos: [
            { monto: 1000, moneda: 'ARS', vencimiento: '2026-09-10', pagado: true },
            { monto: 15000, moneda: 'ARS', vencimiento: '2026-10-10' },
            { monto: 15000, moneda: 'ARS', vencimiento: '2026-11-10' },
            { monto: 300, moneda: 'USD', vencimiento: '2026-11-10' },
        ],
    });
}

async function criterio8() {
    console.log('  Criterio 8: un monto sin pagar por cuota, y los demás no cambian');
    const deudaId = await armar();
    await refinanciarEgreso({ deudaId, moneda: 'ARS', cuotas: CUOTAS, fecha: '2026-11-03' });
    const { montos } = await getDeuda(deudaId);
    const pesos = montos.filter((m) => m.moneda === 'ARS' && !m.pagado);
    assert(pesos.map((m) => m.monto).join() === '5000,4800.5', 'queda un monto por cuota, en orden');
    assert(pesos[1].vencimiento === '2027-01-10' && pesos[1].periodo === '2027-01', 'con su vencimiento y período');
    assert(montos.some((m) => m.pagado && m.monto === 1000), 'el pagado no cambia');
    assert(montos.some((m) => m.moneda === 'USD' && m.monto === 300), 'la otra moneda no cambia');
    const viejos = await listRefinanciados(deudaId);
    assert(viejos.length === 2 && viejos.every((m) => m.refinanciadoEl === '2026-11-03'), 'los reemplazados quedan con la fecha');
}

async function criterio9() {
    console.log('  Criterio 9: el adelanto es un monto más, ya pagado');
    const deudaId = await armar();
    await refinanciarEgreso({ deudaId, moneda: 'ARS', cuotas: CUOTAS, adelanto: { monto: 20000, fecha: '2026-11-01' }, fecha: '2026-11-03' });
    const adelanto = (await getDeuda(deudaId)).montos.find((m) => m.monto === 20000);
    assert(adelanto?.pagado === true && adelanto.vencimiento === '2026-11-01' && adelanto.periodo === '2026-11', 'pagado, en el mes de su fecha');
}

async function criterio12() {
    console.log('  Criterio 12: refinanciar otra vez solo reemplaza lo que está sin pagar');
    const deudaId = await armar();
    await refinanciarEgreso({ deudaId, moneda: 'ARS', cuotas: CUOTAS, fecha: '2026-11-03' });
    await refinanciarEgreso({ deudaId, moneda: 'ARS', cuotas: [{ monto: 9000, vencimiento: '2027-02-10' }], fecha: '2026-11-04' });
    const viejos = await listRefinanciados(deudaId);
    assert(viejos.filter((m) => m.refinanciadoEl === '2026-11-03').length === 2, 'los anteriores no cambian');
    assert(viejos.filter((m) => m.refinanciadoEl === '2026-11-04').length === 2, 'suma las cuotas del plan anterior');
}

async function errorAlGuardar() {
    console.log('  Error: si no se puede guardar, no cambia ningún monto');
    const deudaId = await armar();
    let rechazo = false;
    await refinanciarEgreso({ deudaId, moneda: 'ARS', cuotas: [{ monto: () => {}, vencimiento: '2026-12-10' }], fecha: '2026-11-03' }).catch(() => { rechazo = true; });
    assert(rechazo, 'rechaza');
    assert((await getDeuda(deudaId)).montos.length === 4 && (await listRefinanciados(deudaId)).length === 0, 'todo queda como estaba');
}

async function versionConservaLoCargado() {
    console.log('  Versión 7: conserva lo cargado');
    getDB().close();
    await espera(indexedDB.deleteDatabase(DB_NAME));
    const abrir = indexedDB.open(DB_NAME, 6);
    abrir.onupgradeneeded = () => {
        abrir.result.createObjectStore(DEUDAS_STORE, { keyPath: 'id', autoIncrement: true });
        const montos = abrir.result.createObjectStore(MONTOS_STORE, { keyPath: 'id', autoIncrement: true });
        montos.createIndex('by_deudaId', 'deudaId');
        montos.createIndex('by_periodo', 'periodo');
    };
    const vieja = await espera(abrir);
    await espera(vieja.transaction(MONTOS_STORE, 'readwrite').objectStore(MONTOS_STORE).add({ deudaId: 1, monto: 10, periodo: '2026-11' }));
    vieja.close();
    await initDB();
    assert(getDB().version === VERSION && VERSION === 7, 'la base queda en la versión 7');
    assert((await espera(getDB().transaction(MONTOS_STORE).objectStore(MONTOS_STORE).getAll())).length === 1, 'los montos siguen');
    assert((await listRefinanciados()).length === 0, 'el almacén arranca vacío');
    await espera(getDB().transaction(MONTOS_STORE, 'readwrite').objectStore(MONTOS_STORE).clear());
    assert(Boolean(new FakeIDB().transaction('refinanciados').objectStore('refinanciados')), 'el respaldo sin IndexedDB tiene el almacén');
}

export const tests = [criterio8, criterio9, criterio12, errorAlGuardar, versionConservaLoCargado];
