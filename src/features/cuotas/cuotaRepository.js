// src/repository/cuotaRepository.js
// Repository for Cuota CRUD/query operations
import { getDB } from '../../shared/database/initDB.js';
import { CUOTAS_STORE } from '../../shared/database/schema.js';
import { CuotaEntity } from './CuotaEntity.js';
import { trackEvent, trackFlowError } from '../../shared/observability/index.js';

function _getCuotasStore(mode = 'readonly') {
    const db = getDB();
    const transaction = db.transaction(CUOTAS_STORE, mode);
    return transaction.objectStore(CUOTAS_STORE);
}

function _withCuotasStore(mode, fn) {
    return new Promise((resolve, reject) => {
        const cuotasStore = _getCuotasStore(mode);
        fn(cuotasStore, resolve, reject);
    });
}

export function addCuota(cuotaModel) {
    return _withCuotasStore('readwrite', (cuotasStore, resolve, reject) => {
        const cuotaEntity = new CuotaEntity(cuotaModel);
        const request = cuotasStore.add(cuotaEntity);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(new Error('Error adding cuota: ' + event.target.errorCode));
    });
}

export function updateCuota(cuotaModel) {
    return _withCuotasStore('readwrite', (cuotasStore, resolve, reject) => {
        const cuotaEntity = new CuotaEntity(cuotaModel);
        const request = cuotasStore.put(cuotaEntity);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(new Error('Error updating cuota: ' + event.target.errorCode));
    });
}

export function deleteCuota(id) {
    return _withCuotasStore('readwrite', (cuotasStore, resolve, reject) => {
        const request = cuotasStore.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(new Error('Error deleting cuota: ' + event.target.errorCode));
    });
}

export function getCuota(id) {
    return _withCuotasStore('readonly', (cuotasStore, resolve, reject) => {
        const request = cuotasStore.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(new Error('Error getting cuota: ' + event.target.errorCode));
    });
}

export function listCuotas({ mes } = {}) {
    return _withCuotasStore('readonly', (cuotasStore, resolve, reject) => {
        const index = cuotasStore.index('by_periodo');
        const request = mes ? index.getAll(mes):index.getAll();
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = (event) => reject(new Error('Error listing cuotas: ' + event.target.errorCode));
    });
}

export function setPagado(id, pagado) {
    return _withCuotasStore('readwrite', (cuotasStore, resolve, reject) => {
        const getRequest = cuotasStore.get(id);
        getRequest.onsuccess = () => {
            const cuota = getRequest.result;
            if (!cuota) {
                trackFlowError('payment', { cuotaId: id, reason: 'cuota_not_found' });
                return reject(new Error('Cuota no encontrada'));
            }
            cuota.pagado = pagado;
            const putRequest = cuotasStore.put(cuota);
            putRequest.onsuccess = () => {
                if (pagado) {
                    trackEvent('payment_registered', {
                        flow: 'register_payment',
                        status: 'completed',
                        cuotaId: id,
                        deudaId: cuota.deudaId,
                        moneda: cuota.moneda,
                        amount: cuota.cuota
                    });
                }
                resolve(cuota);
            };
            putRequest.onerror = (event) => {
                trackFlowError('payment', { cuotaId: id, reason: 'update_failed' });
                reject(new Error('Error actualizando pagado: ' + event.target.errorCode));
            };
        };
        getRequest.onerror = (event) => {
            trackFlowError('payment', { cuotaId: id, reason: 'read_failed' });
            reject(new Error('Error obteniendo cuota: ' + event.target.errorCode));
        };
    });
}

// Devuelve totales pagados y pendientes por moneda para un mes dado
export function countCuotasByMes({ mes } = {}) {
    return _withCuotasStore('readonly', (cuotasStore, resolve, reject) => {
        const index = cuotasStore.index('by_periodo');
        const request = mes ? index.getAll(mes) : index.getAll();
        request.onsuccess = () => {
            const cuotas = request.result;
            const totalesPendientes = {};
            const totalesPagados = {};
            cuotas.forEach(row => {
                if (row.pagado) {
                    totalesPagados[row.moneda] = (totalesPagados[row.moneda] || 0) + (Number(row.cuota) || 0);
                } else {
                    totalesPendientes[row.moneda] = (totalesPendientes[row.moneda] || 0) + (Number(row.cuota) || 0);
                }
            });
            resolve({ totalesPendientes, totalesPagados });
        };
        request.onerror = (event) => reject(new Error('Error contando cuotas: ' + event.target.errorCode));
    });
}
