import { CuotaEntity } from '../../cuotas/CuotaEntity.js';
import { getCuotaValue } from '../../../shared/database/cuotaCompatibility.js';

/**
 * Sincroniza cuotas usando un objectStore que pertenece a una transacción
 * readwrite creada externamente.
 * El Promise se resuelve/rechaza cuando esa transacción externa completa o falla.
 */
export function syncCuotasUseCase({ cuotasStore, deudaId, cuotas }) {
    return new Promise((resolve, reject) => {
        const transaction = cuotasStore.transaction;
        let settled = false;

        const rejectOnce = (error) => {
            if (settled) return;
            settled = true;
            reject(error);
        };

        transaction.oncomplete = () => {
            if (settled) return;
            settled = true;
            resolve();
        };

        transaction.onerror = (event) => {
            rejectOnce(new Error('Error syncing cuotas: ' + event.target.errorCode));
        };

        transaction.onabort = (event) => {
            rejectOnce(new Error('Transaction aborted syncing cuotas: ' + event.target.errorCode));
        };

        const index = cuotasStore.index('by_deudaId');
        const getCuotas = index.getAll(deudaId);

        getCuotas.onsuccess = () => {
            const cuotasActuales = getCuotas.result || [];
            const nuevosCuotas = cuotas || [];
            const nuevosIds = nuevosCuotas.filter(m => m.id).map(m => m.id);

            cuotasActuales.forEach(cuotaBD => {
                if (!nuevosIds.includes(cuotaBD.id)) {
                    cuotasStore.delete(cuotaBD.id);
                }
            });

            nuevosCuotas.forEach(cuota => {
                const cuotaEntity = new CuotaEntity({
                    deudaId,
                    cuota: getCuotaValue(cuota),
                    moneda: cuota.moneda,
                    vencimiento: cuota.vencimiento,
                    periodo: cuota.periodo,
                    pagado: !!cuota.pagado
                });

                if (cuota.id) {
                    cuotaEntity.id = cuota.id;
                    cuotasStore.put(cuotaEntity);
                } else {
                    cuotasStore.add(cuotaEntity);
                }
            });
        };

        getCuotas.onerror = (event) => {
            rejectOnce(new Error('Error getting cuotas for sync: ' + event.target.errorCode));
        };
    });
}
