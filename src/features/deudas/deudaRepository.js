// src/repository/deudaRepository.js
// Centralized repository for Deuda and Cuota CRUD/query operations
// Limpieza final: este archivo solo debe manejar operaciones de Deuda.
// No debe haber lógica de Cuota separada aquí, solo la relación para agregar/actualizar/borrar cuotas asociadas a una deuda.
import { getDB } from '../../shared/database/initDB.js';
import { DEUDAS_STORE, CUOTAS_STORE } from '../../shared/database/schema.js';
import { DeudaEntity } from './DeudaEntity.js';
import { CuotaEntity } from '../cuotas/CuotaEntity.js';
import { mergeDeudaUseCase } from './use-cases/mergeDeudaUseCase.js';
import { syncCuotasUseCase } from './use-cases/syncCuotasUseCase.js';

function getIDBErrorDetail(event) {
    return event?.target?.error?.message || event?.target?.errorCode || 'unknown';
}

export function addDeuda(deudaModel) {
    const db = getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([DEUDAS_STORE, CUOTAS_STORE], 'readwrite');
        const deudasStore = transaction.objectStore(DEUDAS_STORE);
        const cuotasStore = transaction.objectStore(CUOTAS_STORE);
        let deudaId = null;
        let settled = false;

        const rejectOnce = (error) => {
            if (settled) return;
            settled = true;
            reject(error);
        };

        transaction.oncomplete = () => {
            if (settled) return;
            settled = true;
            resolve(deudaId);
        };

        transaction.onerror = (event) => {
            rejectOnce(new Error('Error adding deuda: ' + getIDBErrorDetail(event)));
        };

        transaction.onabort = (event) => {
            rejectOnce(new Error('Transaction aborted adding deuda: ' + getIDBErrorDetail(event)));
        };

        const deudaEntity = new DeudaEntity({
            acreedor: deudaModel.acreedor,
            tipoDeuda: deudaModel.tipoDeuda,
            notas: deudaModel.notas
        });
        const deudaRequest = deudasStore.add(deudaEntity);
        deudaRequest.onsuccess = () => {
            deudaId = deudaRequest.result;
            if (deudaModel.cuotas && deudaModel.cuotas.length > 0) {
                deudaModel.cuotas.forEach(cuota => {
                    const cuotaEntity = new CuotaEntity({
                        deudaId,
                        cuota: cuota.cuota,
                        moneda: cuota.moneda,
                        vencimiento: cuota.vencimiento,
                        periodo: cuota.periodo,
                        pagado: !!cuota.pagado
                    });
                    cuotasStore.add(cuotaEntity);
                });
            }
        };
        deudaRequest.onerror = (event) => {
            rejectOnce(new Error('Error adding deuda: ' + getIDBErrorDetail(event)));
        };
    });
}

/**
 * Agrega una deuda o, si existe una deuda con el mismo acreedor+tipoDeuda,
 * fusiona las cuotas evitando duplicados.
 * Retorna el id de la deuda (nuevo o existente).
 */
export function addOrMergeDeuda(deudaModel) {
    const db = getDB();
    return mergeDeudaUseCase({
        db,
        deudaModel,
        addDeuda,
        updateDeuda
    });
}

export function updateDeuda(deudaModel) {
    // Validación: el id debe existir
    if (!deudaModel.id) {
        throw new Error('updateDeuda: El id de la deuda es requerido');
    }
    const db = getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([DEUDAS_STORE, CUOTAS_STORE], 'readwrite');
        const deudasStore = transaction.objectStore(DEUDAS_STORE);
        const cuotasStore = transaction.objectStore(CUOTAS_STORE);
        const deudaEntity = new DeudaEntity({
            id: deudaModel.id,
            acreedor: deudaModel.acreedor,
            tipoDeuda: deudaModel.tipoDeuda,
            notas: deudaModel.notas
        });
        const deudaRequest = deudasStore.put(deudaEntity);
        deudaRequest.onsuccess = () => {
            syncCuotasUseCase({
                cuotasStore,
                deudaId: deudaModel.id,
                cuotas: deudaModel.cuotas || []
            }).then(resolve).catch(reject);
        };
        deudaRequest.onerror = (event) => {
            reject(new Error('Error updating deuda: ' + getIDBErrorDetail(event)));
        };
    });
}

export function deleteDeuda(id) {
    const db = getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([DEUDAS_STORE, CUOTAS_STORE], 'readwrite');
        const deudasStore = transaction.objectStore(DEUDAS_STORE);
        const cuotasStore = transaction.objectStore(CUOTAS_STORE);
        let deletedCuotasCount = 0;
        let settled = false;

        const rejectOnce = (error) => {
            if (settled) return;
            settled = true;
            reject(error);
        };

        transaction.oncomplete = () => {
            if (settled) return;
            settled = true;
            resolve(deletedCuotasCount);
        };

        transaction.onerror = (event) => {
            rejectOnce(new Error('Error deleting deuda: ' + getIDBErrorDetail(event)));
        };

        transaction.onabort = (event) => {
            rejectOnce(new Error('Transaction aborted deleting deuda: ' + getIDBErrorDetail(event)));
        };

        const deudaRequest = deudasStore.delete(id);
        deudaRequest.onsuccess = () => {
            const index = cuotasStore.index('by_deudaId');
            const getCuotas = index.getAllKeys(id);
            getCuotas.onsuccess = () => {
                const keys = getCuotas.result;
                deletedCuotasCount = keys.length;
                keys.forEach(key => cuotasStore.delete(key));
            };
            getCuotas.onerror = (event) => {
                rejectOnce(new Error('Error deleting cuotas: ' + getIDBErrorDetail(event)));
            };
        };
        deudaRequest.onerror = (event) => {
            rejectOnce(new Error('Error deleting deuda: ' + getIDBErrorDetail(event)));
        };
    });
}

export function getDeuda(id) {
    const db = getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([DEUDAS_STORE, CUOTAS_STORE], 'readonly');
        const deudasStore = transaction.objectStore(DEUDAS_STORE);
        const cuotasStore = transaction.objectStore(CUOTAS_STORE);
        const deudaRequest = deudasStore.get(id);
        deudaRequest.onsuccess = () => {
            const deuda = deudaRequest.result;
            if (!deuda) {
                resolve(null);
                return;
            }
            const index = cuotasStore.index('by_deudaId');
            const cuotasRequest = index.getAll(id);
            cuotasRequest.onsuccess = () => {
                deuda.cuotas = cuotasRequest.result;
                resolve(deuda);
            };
                cuotasRequest.onerror = (event) => {
                    reject(new Error('Error getting cuotas: ' + event.target.errorCode));
                };
        };
        deudaRequest.onerror = (event) => {
                reject(new Error('Error getting deuda: ' + event.target.errorCode));
            };
    });
}

export function listDeudas() {
    const db = getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([DEUDAS_STORE, CUOTAS_STORE], 'readonly');
        const deudasStore = transaction.objectStore(DEUDAS_STORE);
        const cuotasStore = transaction.objectStore(CUOTAS_STORE);
        const deudasRequest = deudasStore.getAll();
        deudasRequest.onsuccess = () => {
            const deudas = deudasRequest.result;
            const cuotasRequest = cuotasStore.getAll();
            cuotasRequest.onsuccess = () => {
                const cuotas = cuotasRequest.result;
                const cuotasPorDeuda = {};
                cuotas.forEach(m => {
                    if (!cuotasPorDeuda[m.deudaId]) cuotasPorDeuda[m.deudaId] = [];
                    cuotasPorDeuda[m.deudaId].push(m);
                });
                deudas.forEach(d => {
                    d.cuotas = cuotasPorDeuda[d.id] || [];
                });
                resolve(deudas);
            };
                cuotasRequest.onerror = (event) => {
                    reject(new Error('Error getting cuotas: ' + event.target.errorCode));
                };
        };
        deudasRequest.onerror = (event) => {
            reject('Error getting deudas: ' + event.target.errorCode);
        };
    });
}

export function deleteDeudas() {
    const db = getDB();
    return new Promise((resolve, reject) => {
        if (!db) {
            return reject(new Error('deleteDeudas: database not initialized'));
        }

        try {
            const transaction = db.transaction([DEUDAS_STORE, CUOTAS_STORE], 'readwrite');
            const deudasStore = transaction.objectStore(DEUDAS_STORE);
            const cuotasStore = transaction.objectStore(CUOTAS_STORE);
            let settled = false;
            let failedStoreName = '';
            let failedDetail = '';

            const rejectOnce = (error) => {
                if (settled) return;
                settled = true;
                reject(error);
            };
            const markRequestFailure = (storeName, event) => {
                failedStoreName = storeName;
                failedDetail = getIDBErrorDetail(event);
                rejectOnce(new Error(`Error clearing ${storeName}: ${failedDetail}`));
            };

            transaction.onerror = (event) => {
                const target = failedStoreName || 'data';
                const detail = failedDetail || getIDBErrorDetail(event);
                rejectOnce(new Error(`Transaction error clearing ${target}: ${detail}`));
            };

            transaction.onabort = (event) => {
                const target = failedStoreName || 'data';
                const detail = failedDetail || getIDBErrorDetail(event);
                rejectOnce(new Error(`Transaction aborted clearing ${target}: ${detail}`));
            };

            transaction.oncomplete = () => {
                if (settled) return;
                settled = true;
                resolve();
            };

            const clearCuotasRequest = cuotasStore.clear();
            clearCuotasRequest.onsuccess = () => {
                const clearDeudasRequest = deudasStore.clear();
                clearDeudasRequest.onerror = (event) => {
                    markRequestFailure(DEUDAS_STORE, event);
                };
            };
            clearCuotasRequest.onerror = (event) => {
                markRequestFailure(CUOTAS_STORE, event);
            };
        } catch (err) {
            reject(new Error('deleteDeudas: ' + err.message));
        }
    });
}
