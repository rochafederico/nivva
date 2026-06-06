import { DEUDAS_STORE, CUOTAS_STORE } from '../../../shared/database/schema.js';

function normalizeText(value) {
    return (value || '').toString().trim().toLowerCase();
}

function cuotaEqual(a, b) {
    const ma = Number(a.cuota);
    const mb = Number(b.cuota);
    if (ma !== mb) return false;
    if ((a.moneda || 'ARS') !== (b.moneda || 'ARS')) return false;

    const periodoA = a.periodo || (a.vencimiento ? a.vencimiento.slice(0, 7) : '');
    const periodoB = b.periodo || (b.vencimiento ? b.vencimiento.slice(0, 7) : '');
    if (periodoA && periodoB && periodoA === periodoB) return true;

    return !!(a.vencimiento && b.vencimiento && a.vencimiento === b.vencimiento);
}

function toMergeCuota(cuota) {
    return {
        cuota: cuota.cuota,
        moneda: cuota.moneda,
        vencimiento: cuota.vencimiento,
        periodo: cuota.periodo,
        pagado: !!cuota.pagado
    };
}

export function mergeDeudaUseCase({ db, deudaModel, addDeuda, updateDeuda }) {
    // Este merge prioriza simplicidad sobre atomicidad total.
    // La lectura de coincidencias y la escritura final ocurren en transacciones separadas.
    // En el uso actual de la app, las operaciones se ejecutan desde un único cliente local.
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([DEUDAS_STORE, CUOTAS_STORE], 'readonly');
        const deudasStore = transaction.objectStore(DEUDAS_STORE);
        const cuotasStore = transaction.objectStore(CUOTAS_STORE);
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

            const index = cuotasStore.index('by_deudaId');
            const getCuotasReq = index.getAll(existing.id);
            getCuotasReq.onsuccess = () => {
                const cuotasActuales = getCuotasReq.result || [];
                const incoming = deudaModel.cuotas || [];
                const nuevosCuotas = incoming.filter(inc => !cuotasActuales.some(actual => cuotaEqual(actual, inc)));
                const unionCuotas = cuotasActuales.concat(nuevosCuotas.map(toMergeCuota));

                updateDeuda({
                    id: existing.id,
                    acreedor: deudaModel.acreedor,
                    tipoDeuda: deudaModel.tipoDeuda,
                    notas: deudaModel.notas,
                    cuotas: unionCuotas
                }).then(() => resolve(existing.id)).catch(reject);
            };
            getCuotasReq.onerror = (event) => {
                reject(new Error('Error getting cuotas for merge: ' + event.target.errorCode));
            };
        };

        getAllReq.onerror = (event) => {
            reject(new Error('Error reading deudas: ' + event.target.errorCode));
        };
    });
}
