// src/features/gastos/gastoRepository.js
import { getDB } from '../../shared/database/initDB.js';
import { GASTOS_STORE } from '../../shared/database/schema.js';
import { GastoEntity } from './GastoEntity.js';

function pedir(modo, accion, mensaje, transformar = (r) => r) {
    return new Promise((resolve, reject) => {
        try {
            const store = getDB().transaction(GASTOS_STORE, modo).objectStore(GASTOS_STORE);
            const req = accion(store);
            req.onsuccess = () => resolve(transformar(req.result));
            req.onerror = (e) => reject(new Error(`${mensaje}: ${e.target.errorCode}`));
        } catch (err) {
            reject(err);
        }
    });
}

export function addGasto(gasto) {
    return pedir('readwrite', (s) => s.add({ ...new GastoEntity({ ...gasto, id: undefined }) }), 'Error adding gasto');
}

export function updateGasto(gasto) {
    return pedir('readwrite', (s) => s.put({ ...new GastoEntity(gasto) }), 'Error updating gasto');
}

export function deleteGasto(id) {
    return pedir('readwrite', (s) => s.delete(id), 'Error deleting gasto');
}

export function getGasto(id) {
    return pedir('readonly', (s) => s.get(id), 'Error getting gasto');
}

export function listGastos({ mes } = {}) {
    return pedir('readonly', (s) => s.index('by_periodo').getAll(mes), 'Error listing gastos');
}

export function getAll() {
    return pedir('readonly', (s) => s.getAll(), 'Error getting all gastos');
}

export function deleteAllGastos() {
    return pedir('readwrite', (s) => s.clear(), 'Error clearing gastos');
}

export function sumGastosByMonth({ mes } = {}) {
    return listGastos({ mes }).then((filas) => filas.reduce((totales, { moneda, monto }) => {
        totales[moneda] = (totales[moneda] || 0) + (Number(monto) || 0);
        return totales;
    }, {}));
}
