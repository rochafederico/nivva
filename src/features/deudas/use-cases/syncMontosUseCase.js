import { MontoEntity } from '../../montos/MontoEntity.js';

export function syncMontosUseCase({ montosStore, deudaId, montos }) {
    return new Promise((resolve, reject) => {
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

            resolve();
        };

        getMontos.onerror = (event) => {
            reject(new Error('Error updating montos: ' + event.target.errorCode));
        };
    });
}
