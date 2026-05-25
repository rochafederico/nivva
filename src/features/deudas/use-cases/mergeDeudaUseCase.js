import { DEUDAS_STORE, MONTOS_STORE } from '../../../shared/database/schema.js';

function normalizeText(value) {
    return (value || '').toString().trim().toLowerCase();
}

function montoEqual(a, b) {
    const ma = Number(a.monto);
    const mb = Number(b.monto);
    if (ma !== mb) return false;
    if ((a.moneda || 'ARS') !== (b.moneda || 'ARS')) return false;

    const periodoA = a.periodo || (a.vencimiento ? a.vencimiento.slice(0, 7) : '');
    const periodoB = b.periodo || (b.vencimiento ? b.vencimiento.slice(0, 7) : '');
    if (periodoA && periodoB && periodoA === periodoB) return true;

    return !!(a.vencimiento && b.vencimiento && a.vencimiento === b.vencimiento);
}

function toMergeMonto(monto) {
    return {
        monto: monto.monto,
        moneda: monto.moneda,
        vencimiento: monto.vencimiento,
        periodo: monto.periodo,
        pagado: !!monto.pagado
    };
}

export function mergeDeudaUseCase({ db, deudaModel, addDeuda, updateDeuda }) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([DEUDAS_STORE, MONTOS_STORE], 'readonly');
        const deudasStore = transaction.objectStore(DEUDAS_STORE);
        const montosStore = transaction.objectStore(MONTOS_STORE);
        const getAllReq = deudasStore.getAll();

        getAllReq.onsuccess = () => {
            const existing = (getAllReq.result || []).find(d => {
                return normalizeText(d.acreedor) === normalizeText(deudaModel.acreedor)
                    && normalizeText(d.tipoDeuda) === normalizeText(deudaModel.tipoDeuda);
            });

            if (!existing) {
                addDeuda(deudaModel).then(resolve).catch(reject);
                return;
            }

            const index = montosStore.index('by_deudaId');
            const getMontosReq = index.getAll(existing.id);
            getMontosReq.onsuccess = () => {
                const montosActuales = getMontosReq.result || [];
                const incoming = deudaModel.montos || [];
                const nuevosMontos = incoming.filter(inc => !montosActuales.some(actual => montoEqual(actual, inc)));
                const unionMontos = montosActuales.concat(nuevosMontos.map(toMergeMonto));

                updateDeuda({
                    id: existing.id,
                    acreedor: deudaModel.acreedor,
                    tipoDeuda: deudaModel.tipoDeuda,
                    notas: deudaModel.notas,
                    montos: unionMontos
                }).then(() => resolve(existing.id)).catch(reject);
            };
            getMontosReq.onerror = (event) => {
                reject(new Error('Error getting montos for merge: ' + event.target.errorCode));
            };
        };

        getAllReq.onerror = (event) => {
            reject(new Error('Error reading deudas: ' + event.target.errorCode));
        };
    });
}
