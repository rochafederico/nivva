// Spec 003, criterio 20: almacén de gastos y subida de versión sin perder datos.
import { assert } from './setup.js';
import { getDB, initDB } from '../src/shared/database/initDB.js';
import { DB_NAME, DEUDAS_STORE, MONTOS_STORE, VERSION } from '../src/shared/database/schema.js';
import { FakeIDB } from '../src/shared/database/localStorageFallback.js';
import { GastoModel } from '../src/features/gastos/GastoModel.js';
import {
    addGasto, updateGasto, deleteGasto, getGasto, listGastos, deleteAllGastos
} from '../src/features/gastos/gastoRepository.js';

const SUPER = { descripcion: 'Súper', monto: '5000', moneda: 'ARS', fecha: '2026-11-03' };

const espera = (req) => new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
});

async function guardaEditaYElimina() {
    console.log('  Gastos: guarda, edita y elimina');
    await deleteAllGastos();
    const id = await addGasto(new GastoModel(SUPER));
    const guardado = await getGasto(id);
    assert(guardado.monto === 5000 && guardado.periodo === '2026-11', 'guarda el monto y calcula el período');
    assert(!('acreedor' in guardado) && !('vencimiento' in guardado), 'no tiene acreedor ni vencimiento');
    await updateGasto(new GastoModel({ ...guardado, descripcion: 'Verdulería', fecha: '2026-10-30' }));
    const editado = await getGasto(id);
    assert(editado.id === id && editado.descripcion === 'Verdulería', 'editar conserva el id');
    assert(editado.periodo === '2026-10', 'editar la fecha actualiza el período');
    await deleteGasto(id);
    assert(await getGasto(id) === undefined, 'eliminar lo saca del almacén');
}

async function listaYSumaPorMes() {
    console.log('  Gastos: lista por mes');
    await deleteAllGastos();
    await addGasto(new GastoModel(SUPER));
    await addGasto(new GastoModel({ ...SUPER, fecha: '2026-10-01' }));
    assert((await listGastos({ mes: '2026-11' })).length === 1, 'lista solo los del mes');
    assert((await listGastos()).length === 2, 'sin mes lista todos');
    await deleteAllGastos();
}

async function subirVersionConservaLoCargado() {
    console.log('  Criterio 20: pasar a la versión 6 conserva lo cargado');
    getDB().close();
    await espera(indexedDB.deleteDatabase(DB_NAME));
    const abrir = indexedDB.open(DB_NAME, 5);
    abrir.onupgradeneeded = () => {
        abrir.result.createObjectStore(DEUDAS_STORE, { keyPath: 'id', autoIncrement: true });
        const montos = abrir.result.createObjectStore(MONTOS_STORE, { keyPath: 'id', autoIncrement: true });
        montos.createIndex('by_deudaId', 'deudaId');
        montos.createIndex('by_periodo', 'periodo');
    };
    const vieja = await espera(abrir);
    const tx = vieja.transaction(DEUDAS_STORE, 'readwrite');
    await espera(tx.objectStore(DEUDAS_STORE).add({ acreedor: 'Banco', notas: 'vieja' }));
    vieja.close();

    await initDB();
    assert(getDB().version === VERSION && VERSION === 6, 'la base queda en la versión 6');
    const deudas = await espera(getDB().transaction(DEUDAS_STORE).objectStore(DEUDAS_STORE).getAll());
    assert(deudas.length === 1 && deudas[0].acreedor === 'Banco', 'el egreso viejo sigue con sus datos');
    assert((await listGastos()).length === 0, 'el almacén de gastos arranca vacío');
    await espera(getDB().transaction(DEUDAS_STORE, 'readwrite').objectStore(DEUDAS_STORE).clear());
}

async function respaldoGuardaGastos() {
    console.log('  Gastos: el respaldo sin IndexedDB también los guarda');
    const db = new FakeIDB();
    const store = (modo) => db.transaction('gastos', modo).objectStore('gastos');
    const id = await espera(store('readwrite').add({ descripcion: 'Súper', periodo: '2026-11' }));
    const filas = await espera(store('readonly').index('by_periodo').getAll('2026-11'));
    assert(filas.some((f) => f.id === id), 'lista por período en el respaldo');
    await espera(store('readwrite').clear());
}

export const tests = [guardaEditaYElimina, listaYSumaPorMes, subirVersionConservaLoCargado, respaldoGuardaGastos];
