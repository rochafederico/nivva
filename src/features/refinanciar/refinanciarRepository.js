// Refinanciar en una sola transacción: si algo falla, no cambia ningún monto.
import { getDB } from '../../shared/database/initDB.js';
import { MONTOS_STORE, REFINANCIADOS_STORE, REFINANCIACIONES_STORE } from '../../shared/database/schema.js';
import { MontoEntity } from '../montos/MontoEntity.js';
import { RefinanciadoEntity } from './RefinanciadoEntity.js';

/**
 * @param {Object} datos
 * @param {number} datos.deudaId
 * @param {string} datos.moneda Solo se reemplazan los montos sin pagar de esta moneda.
 * @param {Array<{monto: number, vencimiento: string}>} datos.cuotas
 * @param {{monto: number, fecha: string}|null} [datos.adelanto]
 * @param {string} datos.fecha Día de la refinanciación (YYYY-MM-DD).
 */
export function refinanciarEgreso({ deudaId, moneda, cuotas, adelanto = null, fecha }) {
    return new Promise((resolve, reject) => {
        const tx = getDB().transaction([MONTOS_STORE, REFINANCIADOS_STORE, REFINANCIACIONES_STORE], 'readwrite');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(new Error('Error al refinanciar'));
        tx.onabort = () => reject(new Error('Error al refinanciar'));
        const montos = tx.objectStore(MONTOS_STORE);
        const refinanciados = tx.objectStore(REFINANCIADOS_STORE);
        const pedido = montos.index('by_deudaId').getAll(deudaId);
        pedido.onsuccess = () => {
            try {
                pedido.result.filter((m) => !m.pagado && m.moneda === moneda).forEach((m) => {
                    refinanciados.add(new RefinanciadoEntity({ ...m, refinanciadoEl: fecha }));
                    montos.delete(m.id);
                });
                // El plan como se registró: no cambia aunque después se editen sus montos (criterio 13).
                tx.objectStore(REFINANCIACIONES_STORE).add({ deudaId, fecha, moneda, cuotas: cuotas.map((c) => c.monto) });
                cuotas.forEach(({ monto, vencimiento }) => {
                    montos.add(new MontoEntity({ deudaId, monto, moneda, vencimiento }));
                });
                if (adelanto) {
                    montos.add(new MontoEntity({ deudaId, monto: adelanto.monto, moneda, vencimiento: adelanto.fecha, pagado: true }));
                }
            } catch {
                tx.abort();
            }
        };
    });
}

function pedir(modo, armar, mensaje, almacen = REFINANCIADOS_STORE) {
    return new Promise((resolve, reject) => {
        const tx = getDB().transaction(almacen, modo);
        const pedido = armar(tx.objectStore(almacen));
        tx.onerror = () => reject(new Error(mensaje));
        tx.oncomplete = () => resolve(pedido.result);
    });
}

export function listRefinanciados(deudaId) {
    return pedir('readonly', (s) => (deudaId === undefined ? s.getAll() : s.index('by_deudaId').getAll(deudaId)), 'Error al leer los refinanciados');
}

export function deleteAllRefinanciados() {
    return pedir('readwrite', (s) => s.clear(), 'Error al borrar los refinanciados');
}

const porEgreso = (deudaId) => (s) => (deudaId === undefined ? s.getAll() : s.index('by_deudaId').getAll(deudaId));

export function listRefinanciaciones(deudaId) {
    return pedir('readonly', porEgreso(deudaId), 'Error al leer las refinanciaciones', REFINANCIACIONES_STORE);
}

export function deleteAllRefinanciaciones() {
    return pedir('readwrite', (s) => s.clear(), 'Error al borrar las refinanciaciones', REFINANCIACIONES_STORE);
}
