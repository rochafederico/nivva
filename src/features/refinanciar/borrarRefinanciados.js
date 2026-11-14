// Borra lo refinanciado de un egreso: sus montos reemplazados y sus refinanciaciones (criterio 17).
import { getDB } from '../../shared/database/initDB.js';
import { REFINANCIADOS_STORE, REFINANCIACIONES_STORE } from '../../shared/database/schema.js';

export function deleteRefinanciadosDe(deudaId) {
    return new Promise((resolve, reject) => {
        const tx = getDB().transaction([REFINANCIADOS_STORE, REFINANCIACIONES_STORE], 'readwrite');
        [REFINANCIADOS_STORE, REFINANCIACIONES_STORE].forEach((almacen) => {
            const store = tx.objectStore(almacen);
            const pedido = store.index('by_deudaId').getAllKeys(deudaId);
            pedido.onsuccess = () => pedido.result.forEach((id) => store.delete(id));
        });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(new Error('Error al borrar los refinanciados'));
    });
}
