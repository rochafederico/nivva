import { assert } from './setup.js';
import { FakeIDB } from '../src/shared/database/localStorageFallback.js';
import {
    databaseNeedsCuotaMigration,
    migrateCuotasInDatabase,
    normalizeCuotaRecord,
    normalizeIngresoRecord
} from '../src/shared/database/cuotaCompatibility.js';

function requestToPromise(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(new Error(event.target.errorCode));
    });
}

async function addRecord(db, storeName, record) {
    const tx = db.transaction(storeName, 'readwrite');
    return requestToPromise(tx.objectStore(storeName).add(record));
}

async function getAll(db, storeName) {
    const tx = db.transaction(storeName, 'readonly');
    return requestToPromise(tx.objectStore(storeName).getAll());
}

async function testNormalizersAcceptLegacyAmountField() {
    console.log('  UC1: normalizadores aceptan campo legacy y devuelven cuota');

    const cuota = normalizeCuotaRecord({ monto: 12000, moneda: 'ARS', vencimiento: '2026-05-10' });
    assert(cuota.cuota === 12000, 'Compat: cuota toma el valor legacy');
    assert(!Object.prototype.hasOwnProperty.call(cuota, 'monto'), 'Compat: la salida de cuota no conserva el campo legacy');

    const ingreso = normalizeIngresoRecord({ descripcion: 'Sueldo', monto: 450000, fecha: '2026-05-01' });
    assert(ingreso.cuota === 450000, 'Compat: ingreso toma el valor legacy');
    assert(!Object.prototype.hasOwnProperty.call(ingreso, 'monto'), 'Compat: la salida de ingreso no conserva el campo legacy');
}

async function testMigratesLegacyStoresToCuotas() {
    console.log('  UC2: migración copia datos legacy a cuotas y limpia campos anteriores');

    const db = new FakeIDB();
    await addRecord(db, 'montos', {
        deudaId: 1,
        monto: 25000,
        moneda: 'ARS',
        vencimiento: '2026-06-15',
        periodo: '2026-06',
        pagado: false
    });
    await addRecord(db, 'ingresos', {
        descripcion: 'Sueldo legacy',
        monto: 500000,
        moneda: 'ARS',
        fecha: '2026-06-01',
        periodo: '2026-06'
    });

    assert(await databaseNeedsCuotaMigration(db), 'Compat: detecta migración pendiente');

    const result = await migrateCuotasInDatabase(db);
    assert(result.migratedCuotas === 1, 'Compat: migró 1 cuota');
    assert(result.migratedIngresos === 1, 'Compat: migró 1 ingreso');

    const cuotas = await getAll(db, 'cuotas');
    assert(cuotas.length === 1, 'Compat: hay 1 cuota migrada');
    assert(cuotas[0].cuota === 25000, 'Compat: la cuota migrada conserva el valor');
    assert(!Object.prototype.hasOwnProperty.call(cuotas[0], 'monto'), 'Compat: la cuota migrada no conserva el campo legacy');

    const legacyRows = await getAll(db, 'montos');
    assert(legacyRows.length === 0, 'Compat: el store legacy queda limpio');

    const ingresos = await getAll(db, 'ingresos');
    assert(ingresos[0].cuota === 500000, 'Compat: ingreso migrado conserva el valor');
    assert(!Object.prototype.hasOwnProperty.call(ingresos[0], 'monto'), 'Compat: ingreso migrado no conserva el campo legacy');
    assert(!await databaseNeedsCuotaMigration(db), 'Compat: no queda migración pendiente');
}

export const tests = [
    testNormalizersAcceptLegacyAmountField,
    testMigratesLegacyStoresToCuotas,
];
