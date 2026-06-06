import { CUOTAS_STORE, INGRESOS_STORE, LEGACY_MONTOS_STORE } from './schema.js';

export function getCuotaValue(record = {}) {
    return record.cuota ?? record.monto;
}

export function normalizeCuotaRecord(record = {}) {
    const normalized = { ...record, cuota: getCuotaValue(record) };
    delete normalized.monto;
    normalized.moneda = normalized.moneda || 'ARS';
    normalized.periodo = normalized.periodo || (normalized.vencimiento ? normalized.vencimiento.slice(0, 7) : '');
    normalized.pagado = !!normalized.pagado;
    return normalized;
}

export function getLegacyOrCurrentCuotas(deuda = {}) {
    const current = Array.isArray(deuda.cuotas) ? deuda.cuotas : null;
    const legacy = Array.isArray(deuda.montos) ? deuda.montos : null;
    if (current && (current.length > 0 || !legacy)) return current;
    return legacy || [];
}

export function normalizeIngresoRecord(record = {}) {
    const normalized = { ...record, cuota: getCuotaValue(record) };
    delete normalized.monto;
    normalized.moneda = normalized.moneda || 'ARS';
    normalized.periodo = normalized.periodo || (normalized.fecha ? normalized.fecha.slice(0, 7) : '');
    return normalized;
}

export function hasLegacyAmountField(record = {}) {
    return Object.prototype.hasOwnProperty.call(record, 'monto');
}

function storeNamesContains(db, storeName) {
    return !!(
        db?.objectStoreNames?.contains?.(storeName) ||
        db?._stores?.[storeName]
    );
}

function requestToPromise(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = (event) => reject(new Error(event?.target?.error?.message || event?.target?.errorCode || 'Error reading store'));
    });
}

async function getAllFromStore(db, storeName) {
    if (!storeNamesContains(db, storeName)) return [];
    const tx = db.transaction(storeName, 'readonly');
    return requestToPromise(tx.objectStore(storeName).getAll());
}

export async function databaseNeedsCuotaMigration(db) {
    const legacyRows = await getAllFromStore(db, LEGACY_MONTOS_STORE);
    if (legacyRows.length > 0) return true;

    const cuotaRows = await getAllFromStore(db, CUOTAS_STORE);
    if (cuotaRows.some(row => hasLegacyAmountField(row))) return true;

    const ingresoRows = await getAllFromStore(db, INGRESOS_STORE);
    return ingresoRows.some(row => hasLegacyAmountField(row));
}

function cuotaIdentity(record = {}) {
    const periodo = record.periodo || (record.vencimiento ? record.vencimiento.slice(0, 7) : '');
    return [
        record.deudaId ?? '',
        Number(getCuotaValue(record) || 0),
        record.moneda || 'ARS',
        periodo,
        record.vencimiento || ''
    ].join('|');
}

export function migrateCuotasInDatabase(db) {
    return new Promise((resolve, reject) => {
        if (!db) {
            resolve({ migratedCuotas: 0, migratedIngresos: 0, legacyCleared: false });
            return;
        }

        const hasLegacyStore = storeNamesContains(db, LEGACY_MONTOS_STORE);
        const storeNames = [CUOTAS_STORE, INGRESOS_STORE];
        if (hasLegacyStore) storeNames.push(LEGACY_MONTOS_STORE);

        let tx;
        try {
            tx = db.transaction(storeNames, 'readwrite');
        } catch (error) {
            reject(new Error('No pudimos iniciar la migración de cuotas: ' + error.message));
            return;
        }

        const cuotasStore = tx.objectStore(CUOTAS_STORE);
        const ingresosStore = tx.objectStore(INGRESOS_STORE);
        const legacyStore = hasLegacyStore ? tx.objectStore(LEGACY_MONTOS_STORE) : null;
        let settled = false;
        let migratedCuotas = 0;
        let migratedIngresos = 0;
        let pendingReads = hasLegacyStore ? 3 : 2;
        let legacyRows = [];
        let cuotaRows = [];
        let ingresoRows = [];

        const rejectOnce = (error) => {
            if (settled) return;
            settled = true;
            reject(error);
        };

        tx.oncomplete = () => {
            if (settled) return;
            settled = true;
            resolve({ migratedCuotas, migratedIngresos, legacyCleared: hasLegacyStore });
        };
        tx.onerror = (event) => rejectOnce(new Error('Error migrando datos a cuotas: ' + (event?.target?.error?.message || event?.target?.errorCode || 'unknown')));
        tx.onabort = (event) => rejectOnce(new Error('Migración de cuotas cancelada: ' + (event?.target?.error?.message || event?.target?.errorCode || 'unknown')));

        const maybeWrite = () => {
            pendingReads -= 1;
            if (pendingReads > 0) return;

            const cuotasById = new Set(cuotaRows.filter(row => row.id != null).map(row => row.id));
            const cuotasByIdentity = new Set(cuotaRows.map(cuotaIdentity));

            cuotaRows.forEach(row => {
                if (!hasLegacyAmountField(row)) return;
                const normalized = normalizeCuotaRecord(row);
                cuotasStore.put(normalized);
                cuotasByIdentity.add(cuotaIdentity(normalized));
                if (normalized.id != null) cuotasById.add(normalized.id);
                migratedCuotas += 1;
            });

            legacyRows.forEach(row => {
                const normalized = normalizeCuotaRecord(row);
                const duplicateByIdentity = cuotasByIdentity.has(cuotaIdentity(normalized));
                const duplicateById = normalized.id != null && cuotasById.has(normalized.id);
                if (duplicateByIdentity) return;

                if (duplicateById) {
                    delete normalized.id;
                    cuotasStore.add(normalized);
                } else {
                    cuotasStore.put(normalized);
                    if (normalized.id != null) cuotasById.add(normalized.id);
                }
                cuotasByIdentity.add(cuotaIdentity(normalized));
                migratedCuotas += 1;
            });

            ingresoRows.forEach(row => {
                if (!hasLegacyAmountField(row)) return;
                ingresosStore.put(normalizeIngresoRecord(row));
                migratedIngresos += 1;
            });

            if (legacyStore) legacyStore.clear();
        };

        const readCuotas = cuotasStore.getAll();
        readCuotas.onsuccess = () => {
            cuotaRows = readCuotas.result || [];
            maybeWrite();
        };
        readCuotas.onerror = (event) => rejectOnce(new Error('Error leyendo cuotas: ' + event.target.errorCode));

        const readIngresos = ingresosStore.getAll();
        readIngresos.onsuccess = () => {
            ingresoRows = readIngresos.result || [];
            maybeWrite();
        };
        readIngresos.onerror = (event) => rejectOnce(new Error('Error leyendo ingresos: ' + event.target.errorCode));

        if (legacyStore) {
            const readLegacy = legacyStore.getAll();
            readLegacy.onsuccess = () => {
                legacyRows = readLegacy.result || [];
                maybeWrite();
            };
            readLegacy.onerror = (event) => rejectOnce(new Error('Error leyendo datos anteriores: ' + event.target.errorCode));
        }
    });
}
