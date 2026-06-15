// test/import-export.test.js
// E2E tests for import-export feature: ExportDataModal and ImportDataModal
// Tests the full round-trip: create data → export → clear → import → verify
import { assert } from './setup.js';

import { addOrMergeDeuda, listDeudas, deleteDeudas } from '../src/features/deudas/deudaRepository.js';
import '../src/features/deudas/components/DebtList.js';
import StatsIndicators from '../src/features/stats/components/StatsIndicators.js';
import { getSelectedMonth } from '../src/shared/MonthFilter.js';
import { DeudaModel } from '../src/features/deudas/DeudaModel.js';
import { MontoModel } from '../src/features/montos/MontoModel.js';
import { addIngreso, getAll as getAllIngresos } from '../src/features/ingresos/ingresoRepository.js';
import { getDB } from '../src/shared/database/initDB.js';
import { INGRESOS_STORE } from '../src/shared/database/schema.js';
import '../src/features/import-export/components/ExportDataModal.js';
import '../src/features/import-export/components/ImportDataModal.js';

async function cleanupIngresos() {
    return new Promise((resolve, reject) => {
        const tx = getDB().transaction(INGRESOS_STORE, 'readwrite');
        const req = tx.objectStore(INGRESOS_STORE).clear();
        req.onsuccess = () => resolve();
        req.onerror = (e) => reject(e);
    });
}

async function cleanupAll() {
    try { await deleteDeudas(); } catch (_e) { /* ignore */ }
    await cleanupIngresos();
}

async function testImportarDatosCompletos() {
    console.log('  UC1: Importar datos completos (deudas + ingresos)');
    await cleanupAll();
    const modal = document.createElement('import-data-modal');
    document.body.appendChild(modal);
    modal.importData = {
        deudas: [{
            acreedor: 'Banco Test', tipoDeuda: 'Prestamo', notas: 'Prestamo personal',
            montos: [
                { monto: 15000, moneda: 'ARS', vencimiento: '2026-03-15', periodo: '2026-03', pagado: false },
                { monto: 25000, moneda: 'ARS', vencimiento: '2026-04-15', periodo: '2026-04', pagado: true }
            ]
        }],
        ingresos: [
            { descripcion: 'Sueldo', monto: 500000, moneda: 'ARS', fecha: '2026-03-01' },
            { descripcion: 'Freelance', monto: 1000, moneda: 'USD', fecha: '2026-03-15' }
        ]
    };
    await modal.importDataToDb();
    await new Promise(r => setTimeout(r, 100));
    const deudas = await listDeudas();
    assert(deudas.length === 1, 'Import: 1 deuda en DB');
    assert(deudas[0].montos.length === 2, 'Import: 2 montos en la deuda');
    const ingresos = await getAllIngresos();
    assert(ingresos.length === 2, 'Import: 2 ingresos en DB');
    assert(ingresos.find(i => i.descripcion === 'Sueldo').monto === 500000, 'Import: monto Sueldo = 500000');
    document.body.removeChild(modal);
    await cleanupAll();
}

async function testExportarDatosCompletos() {
    console.log('  UC3: Exportar datos y verificar estructura del JSON');
    await cleanupAll();
    await addOrMergeDeuda(new DeudaModel({
        acreedor: 'Banco Export', tipoDeuda: 'Hipotecario', notas: 'Test export',
        montos: [new MontoModel({ monto: 100000, moneda: 'ARS', vencimiento: '2026-06-01', pagado: false })]
    }));
    await addIngreso({ descripcion: 'Bonus', monto: 200000, moneda: 'ARS', fecha: '2026-06-01' });
    const deudas = await listDeudas();
    const ingresos = await getAllIngresos();
    const exportData = {
        deudas: deudas.map(d => ({
            acreedor: d.acreedor,
            tipoDeuda: d.tipoDeuda,
            notas: d.notas,
            montos: (d.montos || []).map(m => ({ monto: m.monto, moneda: m.moneda, vencimiento: m.vencimiento, periodo: m.periodo || (m.vencimiento ? m.vencimiento.slice(0, 7) : ''), pagado: m.pagado }))
        })),
        ingresos
    };
    const parsed = JSON.parse(JSON.stringify(exportData));
    assert(Array.isArray(parsed.deudas), 'Export JSON tiene deudas[]');
    assert(parsed.deudas[0].acreedor === 'Banco Export', 'Export JSON: acreedor correcto');
    assert(!('id' in parsed.deudas[0]), 'Export JSON: deuda no tiene id');
    assert(Array.isArray(parsed.ingresos), 'Export JSON tiene ingresos[]');
    await cleanupAll();
}

async function testRoundTripExportImport() {
    console.log('  UC4: Round-trip completo — exportar, limpiar, importar, verificar');
    await cleanupAll();
    await addOrMergeDeuda(new DeudaModel({
        acreedor: 'Round Trip Bank', tipoDeuda: 'Personal', notas: 'Test round trip',
        montos: [new MontoModel({ monto: 50000, moneda: 'ARS', vencimiento: '2026-07-01', pagado: false }), new MontoModel({ monto: 200, moneda: 'USD', vencimiento: '2026-08-01', pagado: true })]
    }));
    await addIngreso({ descripcion: 'Alquiler', monto: 150000, moneda: 'ARS', fecha: '2026-07-01' });
    const exportJson = { deudas: await listDeudas(), ingresos: await getAllIngresos() };
    await cleanupAll();
    const modal = document.createElement('import-data-modal');
    document.body.appendChild(modal);
    modal.importData = exportJson;
    await modal.importDataToDb();
    await new Promise(r => setTimeout(r, 100));
    assert((await listDeudas()).length === 1, 'RT: 1 deuda restaurada');
    assert((await getAllIngresos()).length === 1, 'RT: 1 ingreso restaurado');
    document.body.removeChild(modal);
    await cleanupAll();
}

async function testImportarConMergeDuplicados() {
    console.log('  UC5: Importar con merge de deudas (no duplicar)');
    await cleanupAll();
    const backupData = { deudas: [{ acreedor: 'Banco Merge', tipoDeuda: 'Prestamo', notas: '', montos: [{ monto: 10000, moneda: 'ARS', vencimiento: '2026-05-01', periodo: '2026-05', pagado: false }] }], ingresos: [] };
    for (let i = 0; i < 2; i++) {
        const modal = document.createElement('import-data-modal');
        document.body.appendChild(modal);
        modal.importData = backupData;
        await modal.importDataToDb();
        document.body.removeChild(modal);
        await new Promise(r => setTimeout(r, 100));
    }
    const deudas = await listDeudas();
    assert(deudas.length === 1, 'Merge: sigue 1 deuda (no duplico)');
    assert(deudas[0].montos.length === 1, 'Merge: sigue 1 monto (no duplico)');
    await cleanupAll();
}

async function testDataImportedRefreshesDebtList() {
    console.log('  UC6: data-imported recarga DebtList automáticamente');
    await cleanupAll();
    const currentMes = getSelectedMonth();
    const list = document.createElement('debt-list');
    document.body.appendChild(list);
    await new Promise(r => setTimeout(r, 50));
    const modal = document.createElement('import-data-modal');
    document.body.appendChild(modal);
    modal.importData = { deudas: [{ acreedor: 'Acreedor Refresh', tipoDeuda: 'Prestamo', notas: '', montos: [{ monto: 5000, moneda: 'ARS', vencimiento: `${currentMes}-15`, periodo: currentMes, pagado: false }] }], ingresos: [] };
    await modal.importDataToDb();
    await new Promise(r => setTimeout(r, 200));
    assert(list.debts.length === 1, 'DebtList debe tener 1 deuda después del import');
    document.body.removeChild(list);
    document.body.removeChild(modal);
    await cleanupAll();
}

async function testDataImportedRefreshesStatsIndicators() {
    console.log('  UC7: data-imported actualiza StatsIndicators automáticamente');
    await cleanupAll();
    const waitFor = async (predicate, timeout = 1000, interval = 25) => {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            if (predicate()) return;
            await new Promise(r => setTimeout(r, interval));
        }
        assert(false, 'Timeout esperando actualización de StatsIndicators');
    };
    const indicators = StatsIndicators({ mes: '2026-05' });
    document.body.appendChild(indicators);
    await waitFor(() => indicators.textContent.trim().length > 0 && !indicators.textContent.includes('Cargando resumen...'));
    const beforeEventHTML = indicators.innerHTML;
    window.dispatchEvent(new CustomEvent('data-imported', { detail: { deudasImported: 1, ingresosImported: 0 } }));
    await waitFor(() => indicators.textContent.includes('Cargando resumen...'));
    assert(indicators.innerHTML !== beforeEventHTML, 'StatsIndicators debe cambiar el DOM al re-renderizarse tras data-imported');
    document.body.removeChild(indicators);
    await cleanupAll();
}

export const tests = [
    testImportarDatosCompletos,
    testExportarDatosCompletos,
    testRoundTripExportImport,
    testImportarConMergeDuplicados,
    testDataImportedRefreshesDebtList,
    testDataImportedRefreshesStatsIndicators,
];
