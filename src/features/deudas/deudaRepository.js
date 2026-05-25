// src/repository/deudaRepository.js
// Centralized repository for Deuda and Monto CRUD/query operations
// Limpieza final: este archivo solo debe manejar operaciones de Deuda.
// No debe haber lógica de Monto separada aquí, solo la relación para agregar/actualizar/borrar montos asociados a una deuda.
import { getDB } from '../../shared/database/initDB.js';
import { DEUDAS_STORE, MONTOS_STORE } from '../../shared/database/schema.js';
import { DeudaEntity } from './DeudaEntity.js';
import { MontoEntity } from '../montos/MontoEntity.js';
import { mergeDeudaUseCase } from './use-cases/mergeDeudaUseCase.js';
import { syncMontosUseCase } from './use-cases/syncMontosUseCase.js';

function getIDBErrorDetail(event) {
    return event?.target?.error?.message || event?.target?.errorCode || 'unknown';
}

export function addDeuda(deudaModel) {
    const db = getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([DEUDAS_STORE, MONTOS_STORE], 'readwrite');
        const deudasStore = transaction.objectStore(DEUDAS_STORE);
        const montosStore = transaction.objectStore(MONTOS_STORE);
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
            if (deudaModel.montos && deudaModel.montos.length > 0) {
                deudaModel.montos.forEach(monto => {
                    const montoEntity = new MontoEntity({
                        deudaId,
                        monto: monto.monto,
                        moneda: monto.moneda,
                        vencimiento: monto.vencimiento,
                        periodo: monto.periodo,
                        pagado: !!monto.pagado
                    });
                    montosStore.add(montoEntity);
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
 * fusiona los montos evitando duplicados.
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
        const transaction = db.transaction([DEUDAS_STORE, MONTOS_STORE], 'readwrite');
        const deudasStore = transaction.objectStore(DEUDAS_STORE);
        const montosStore = transaction.objectStore(MONTOS_STORE);
        const deudaEntity = new DeudaEntity({
            id: deudaModel.id,
            acreedor: deudaModel.acreedor,
            tipoDeuda: deudaModel.tipoDeuda,
            notas: deudaModel.notas
        });
        const deudaRequest = deudasStore.put(deudaEntity);
        deudaRequest.onsuccess = () => {
            syncMontosUseCase({
                montosStore,
                deudaId: deudaModel.id,
                montos: deudaModel.montos || []
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
        const transaction = db.transaction([DEUDAS_STORE, MONTOS_STORE], 'readwrite');
        const deudasStore = transaction.objectStore(DEUDAS_STORE);
        const montosStore = transaction.objectStore(MONTOS_STORE);
        let deletedMontosCount = 0;
        let settled = false;

        const rejectOnce = (error) => {
            if (settled) return;
            settled = true;
            reject(error);
        };

        transaction.oncomplete = () => {
            if (settled) return;
            settled = true;
            resolve(deletedMontosCount);
        };

        transaction.onerror = (event) => {
            rejectOnce(new Error('Error deleting deuda: ' + getIDBErrorDetail(event)));
        };

        transaction.onabort = (event) => {
            rejectOnce(new Error('Transaction aborted deleting deuda: ' + getIDBErrorDetail(event)));
        };

        const deudaRequest = deudasStore.delete(id);
        deudaRequest.onsuccess = () => {
            const index = montosStore.index('by_deudaId');
            const getMontos = index.getAllKeys(id);
            getMontos.onsuccess = () => {
                const keys = getMontos.result;
                deletedMontosCount = keys.length;
                keys.forEach(key => montosStore.delete(key));
            };
            getMontos.onerror = (event) => {
                rejectOnce(new Error('Error deleting montos: ' + getIDBErrorDetail(event)));
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
        const transaction = db.transaction([DEUDAS_STORE, MONTOS_STORE], 'readonly');
        const deudasStore = transaction.objectStore(DEUDAS_STORE);
        const montosStore = transaction.objectStore(MONTOS_STORE);
        const deudaRequest = deudasStore.get(id);
        deudaRequest.onsuccess = () => {
            const deuda = deudaRequest.result;
            if (!deuda) {
                resolve(null);
                return;
            }
            const index = montosStore.index('by_deudaId');
            const montosRequest = index.getAll(id);
            montosRequest.onsuccess = () => {
                deuda.montos = montosRequest.result;
                resolve(deuda);
            };
                montosRequest.onerror = (event) => {
                    reject(new Error('Error getting montos: ' + event.target.errorCode));
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
        const transaction = db.transaction([DEUDAS_STORE, MONTOS_STORE], 'readonly');
        const deudasStore = transaction.objectStore(DEUDAS_STORE);
        const montosStore = transaction.objectStore(MONTOS_STORE);
        const deudasRequest = deudasStore.getAll();
        deudasRequest.onsuccess = () => {
            const deudas = deudasRequest.result;
            const montosRequest = montosStore.getAll();
            montosRequest.onsuccess = () => {
                const montos = montosRequest.result;
                const montosPorDeuda = {};
                montos.forEach(m => {
                    if (!montosPorDeuda[m.deudaId]) montosPorDeuda[m.deudaId] = [];
                    montosPorDeuda[m.deudaId].push(m);
                });
                deudas.forEach(d => {
                    d.montos = montosPorDeuda[d.id] || [];
                });
                resolve(deudas);
            };
                montosRequest.onerror = (event) => {
                    reject(new Error('Error getting montos: ' + event.target.errorCode));
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
            const transaction = db.transaction([DEUDAS_STORE, MONTOS_STORE], 'readwrite');
            const deudasStore = transaction.objectStore(DEUDAS_STORE);
            const montosStore = transaction.objectStore(MONTOS_STORE);
            let settled = false;
            let failedStoreName = '';

            const rejectOnce = (error) => {
                if (settled) return;
                settled = true;
                reject(error);
            };

            transaction.onerror = (event) => {
                const target = failedStoreName || 'data';
                rejectOnce(new Error(`Transaction error clearing ${target}: ${getIDBErrorDetail(event)}`));
            };

            transaction.onabort = (event) => {
                rejectOnce(new Error('Transaction aborted clearing data: ' + getIDBErrorDetail(event)));
            };

            transaction.oncomplete = () => {
                if (settled) return;
                settled = true;
                resolve();
            };

            const clearMontosRequest = montosStore.clear();
            clearMontosRequest.onsuccess = () => {
                const clearDeudasRequest = deudasStore.clear();
                clearDeudasRequest.onerror = () => {
                    failedStoreName = DEUDAS_STORE;
                };
            };
            clearMontosRequest.onerror = () => {
                failedStoreName = MONTOS_STORE;
            };
        } catch (err) {
            reject(new Error('deleteDeudas: ' + err.message));
        }
    });
}
