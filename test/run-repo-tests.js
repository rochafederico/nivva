// Runner: setup (happy-dom + fake-indexeddb) y todas las suites por feature.
import { initDB } from '../src/shared/database/initDB.js';
import { printResults } from './setup.js';
import { tests as deudasTests } from './deudas.test.js';
import { tests as montosTests } from './montos.test.js';
import { tests as ingresosTests } from './ingresos.test.js';
import { tests as importExportTests } from './import-export.test.js';
import { tests as bootstrapStylesTests } from './bootstrap-styles.test.js';
import { tests as tourTests } from './tour.test.js';
import { tests as notificationsTests } from './notifications.test.js';
import { tests as statsTests } from './stats.test.js';
import { tests as monthFilterTests } from './month-filter.test.js';
import { tests as analyticsTests } from './analytics.test.js';
import { tests as feedbackTests } from './feedback.test.js';
import { tests as layoutTests } from './layout.test.js';
import { tests as appFormTests } from './app-form.test.js';
import { tests as pwaResponsiveTests } from './pwa-responsive.test.js';
import { tests as resumenTests } from './resumen.test.js';
import { tests as montosFormatoTests } from './montos-formato.test.js';
import { tests as menuButtonTests } from './menu-button.test.js';
import { tests as menuButtonTeclasTests } from './menu-button-teclas.test.js';
import { tests as montoRowTests } from './monto-row.test.js';
import { tests as montosListTests } from './montos-list.test.js';
import { tests as montosListAccionesTests } from './montos-list-acciones.test.js';
import { tests as debtFormMontosTests } from './debt-form-montos.test.js';
import { tests as montoAbiertoErroresTests } from './monto-abierto-errores.test.js';
import { tests as montosListAbiertoTests } from './montos-list-abierto.test.js';
import { tests as debtFormAgregarTests } from './debt-form-agregar.test.js';
import { tests as debtFormEditarTests } from './debt-form-editar.test.js';
import { tests as montosListUnAbiertoTests } from './montos-list-un-abierto.test.js';
import { tests as debtFormCancelarTests } from './debt-form-cancelar.test.js';
import { tests as debtFormGuardarTests } from './debt-form-guardar.test.js';
import { tests as debtFormSinMontosTests } from './debt-form-sin-montos.test.js';
import { tests as gastosRepositorioTests } from './gastos-repositorio.test.js';

async function run() {
    try {
        await initDB();
        console.log('DB initialized (happy-dom + fake-indexeddb)\n');

        console.log('--- Deudas ---');
        for (const test of deudasTests) { await test(); }

        console.log('\n--- Montos ---');
        for (const test of montosTests) { await test(); }
        console.log('\n--- Ingresos ---');
        for (const test of ingresosTests) { await test(); }
        console.log('\n--- Import/Export ---');
        for (const test of importExportTests) { await test(); }

        console.log('\n--- Bootstrap styles ---');
        for (const test of bootstrapStylesTests) { await test(); }

        console.log('\n--- Tour ---');
        for (const test of tourTests) { await test(); }

        console.log('\n--- Notifications ---');
        for (const test of notificationsTests) { await test(); }

        console.log('\n--- Stats ---');
        for (const test of statsTests) { await test(); }

        console.log('\n--- Month Filter ---');
        for (const test of monthFilterTests) { await test(); }

        console.log('\n--- Analytics ---');
        for (const test of analyticsTests) { await test(); }

        console.log('\n--- Feedback ---');
        for (const test of feedbackTests) { await test(); }

        console.log('\n--- AppForm ---');
        for (const test of appFormTests) { await test(); }

        console.log('\n--- Layout ---');
        for (const test of layoutTests) { await test(); }

        console.log('\n--- Resumen (vista única) ---');
        for (const test of resumenTests) { await test(); }

        console.log('\n--- PWA / Responsive ---');
        for (const test of pwaResponsiveTests) { await test(); }

        console.log('\n--- Spec 001: lista de montos ---');
        for (const test of [...montosFormatoTests, ...menuButtonTests, ...menuButtonTeclasTests, ...montoRowTests,
            ...montosListTests, ...montosListAccionesTests, ...debtFormMontosTests, ...montoAbiertoErroresTests,
            ...montosListAbiertoTests, ...debtFormAgregarTests, ...debtFormEditarTests,
            ...montosListUnAbiertoTests, ...debtFormCancelarTests, ...debtFormGuardarTests,
            ...debtFormSinMontosTests]) { await test(); }
        console.log('\n--- Spec 003: gastos ---'); for (const test of gastosRepositorioTests) { await test(); }

        printResults();
        process.exit(0);
    } catch (err) {
        console.error('Test run failed:', err);
        process.exit(1);
    }
}

run();
