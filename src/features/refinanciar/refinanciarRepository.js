// Refinanciar en una sola transacción: si algo falla, no cambia ningún monto.
import { getDB } from '../../shared/database/initDB.js';
import { MONTOS_STORE, REFINANCIADOS_STORE } from '../../shared/database/schema.js';
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
        const tx = getDB().transaction([MONTOS_STORE, REFINANCIADOS_STORE], 'readwrite');
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

function pedir(modo, armar, mensaje) {
    return new Promise((resolve, reject) => {
        const tx = getDB().transaction(REFINANCIADOS_STORE, modo);
        const pedido = armar(tx.objectStore(REFINANCIADOS_STORE));
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

const mismoRefinanciado = (a, b) => Number(a.monto) === Number(b.monto) && a.moneda === b.moneda
    && a.vencimiento === b.vencimiento && a.refinanciadoEl === b.refinanciadoEl;

/** Suma los de una copia de seguridad, sin repetir los que el egreso ya tiene. */
export async function agregarRefinanciados(deudaId, items = []) {
    if (!items.length) return;
    const actuales = await listRefinanciados(deudaId);
    await new Promise((resolve, reject) => {
        const tx = getDB().transaction(REFINANCIADOS_STORE, 'readwrite');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(new Error('Error al importar los refinanciados'));
        items.filter((r) => !actuales.some((a) => mismoRefinanciado(a, r))).forEach((r) => {
            tx.objectStore(REFINANCIADOS_STORE).add(new RefinanciadoEntity({ ...r, deudaId }));
        });
    });
}
