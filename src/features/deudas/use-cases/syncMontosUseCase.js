import { MontoEntity } from '../../montos/MontoEntity.js';

export function syncMontosUseCase({ montosStore, deudaId, montos }) {
    return new Promise((resolve, reject) => {
        const transaction = montosStore.transaction;
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
            rejectOnce(new Error('Error syncing montos: ' + event.target.errorCode));
        };

        transaction.onabort = (event) => {
            rejectOnce(new Error('Transaction aborted syncing montos: ' + event.target.errorCode));
        };

        const index = montosStore.index('by_deudaId');
        const getMontos = index.getAll(deudaId);

        getMontos.onsuccess = () => {
            const montosActuales = getMontos.result || [];
            const nuevosMontos = montos || [];
            const nuevosIds = nuevosMontos.filter(m => m.id).map(m => m.id);

            montosActuales.forEach(montoBD => {
                if (!nuevosIds.includes(montoBD.id)) {
                    montosStore.delete(montoBD.id);
                }
            });

            nuevosMontos.forEach(monto => {
                const montoEntity = new MontoEntity({
                    deudaId,
                    monto: monto.monto,
                    moneda: monto.moneda,
                    vencimiento: monto.vencimiento,
                    periodo: monto.periodo,
                    pagado: !!monto.pagado
                });

                if (monto.id) {
                    montoEntity.id = monto.id;
                    montosStore.put(montoEntity);
                } else {
                    montosStore.add(montoEntity);
                }
            });
        };

        getMontos.onerror = (event) => {
            rejectOnce(new Error('Error getting montos for sync: ' + event.target.errorCode));
        };
    });
}
