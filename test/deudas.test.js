// test/deudas.test.js
// E2E tests for deudas feature: UI component (DebtForm) → Model → Repository → IndexedDB
import { assert } from './setup.js';
import { deleteDeudas, listDeudas, getDeuda, addOrMergeDeuda } from '../src/features/deudas/deudaRepository.js';
import { listCuotas } from '../src/features/cuotas/cuotaRepository.js';
import { getDB } from '../src/shared/database/initDB.js';
import { debtTableColumns } from '../src/shared/config/tables/debtTableColumns.js';
import { getInitials, getAvatarClasses, getTipoIcon, getEstado, formatDate, DebtRowItem } from '../src/features/deudas/components/DebtRowItem.js';
import { summarizeDebtListTotals } from '../src/features/deudas/components/DebtListTotals.js';

// Import DebtDetailModal component
import '../src/features/deudas/components/DebtDetailModal.js';
import '../src/features/cuotas/components/DuplicateCuotaModal.js';
import { CUOTA_FORM_GENERAL_ERROR_MESSAGE } from '../src/features/cuotas/components/CuotaForm.js';
import '../src/features/deudas/components/DebtForm.js';
import '../src/features/deudas/components/DebtModal.js';
import '../src/features/deudas/components/DebtEntityShell.js';

async function cleanup() {
    try { await deleteDeudas(); } catch (e) { /* ignore */ }
}

// ===================================================================
// UC1: Crear deuda desde DebtForm con cuotas en distintos meses
// Flujo: usuario llena el formulario (acreedor, tipo, notas), agrega
// 3 cuotas en meses distintos (ARS y USD), y hace submit.
// Luego navega por mes y ve las cuotas correctos en cada uno.
// ===================================================================
async function testCrearDeudaDesdeFormulario() {
    console.log('  UC1: Crear deuda desde DebtForm con cuotas por mes');
    await cleanup();

    // Crear el componente DebtForm y montarlo en el DOM
    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    // Simular que el usuario agrega cuotas al formulario
    form.cuotas = [
        { cuota: 15000, moneda: 'ARS', vencimiento: '2026-03-15', pagado: false },
        { cuota: 25000, moneda: 'ARS', vencimiento: '2026-04-15', pagado: false },
        { cuota: 100, moneda: 'USD', vencimiento: '2026-05-15', pagado: false }
    ];

    // Simular submit del formulario (como lo dispara AppForm → DebtForm.handleSubmit)
    let savedEvent = null;
    form.addEventListener('deuda:saved', (e) => { savedEvent = e; });
    await form.handleSubmit({
        preventDefault: () => {},
        detail: { acreedor: 'Banco Galicia', tipoDeuda: 'Prestamo', notas: 'Prestamo personal' }
    });

    // Verificar que el evento de guardado se disparó
    assert(savedEvent !== null, 'El componente debe emitir deuda:saved');

    // Verificar datos en la base de datos
    const deudas = await listDeudas();
    assert(deudas.length === 1, 'Debe existir 1 deuda en la DB');
    assert(deudas[0].acreedor === 'Banco Galicia', 'Acreedor debe ser Banco Galicia');
    assert(deudas[0].cuotas.length === 3, 'Deuda debe tener 3 cuotas');

    // Verificar que las cuotas tienen los datos correctos
    const cuotas = deudas[0].cuotas;
    assert(cuotas.some(m => m.cuota === 15000 && m.moneda === 'ARS'), 'Cuota ARS 15000 presente');
    assert(cuotas.some(m => m.cuota === 25000 && m.moneda === 'ARS'), 'Cuota ARS 25000 presente');
    assert(cuotas.some(m => m.cuota === 100 && m.moneda === 'USD'), 'Cuota USD 100 presente');

    // Limpiar DOM
    document.body.removeChild(form);
    await cleanup();
}

// ===================================================================
// UC2: Editar deuda desde DebtForm (cambiar datos + cuotas)
// Flujo: usuario abre una deuda existente en el formulario (load),
// cambia el acreedor, elimina una cuota, agrega uno nuevo, y guarda.
// ===================================================================
async function testEditarDeudaDesdeFormulario() {
    console.log('  UC2: Editar deuda desde DebtForm');
    await cleanup();

    // Crear deuda inicial via formulario
    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    form.cuotas = [
        { cuota: 5000, moneda: 'ARS', vencimiento: '2026-03-10', pagado: false },
        { cuota: 8000, moneda: 'ARS', vencimiento: '2026-04-10', pagado: false }
    ];
    await form.handleSubmit({
        preventDefault: () => {},
        detail: { acreedor: 'Visa', tipoDeuda: 'Tarjeta', notas: '' }
    });

    // Obtener la deuda creada
    const deudas = await listDeudas();
    const deuda = deudas[0];
    assert(deuda.cuotas.length === 2, 'Deuda original tiene 2 cuotas');

    // Simular edición: usuario abre la deuda con form.load()
    form.load(deuda);
    assert(form.editing === true, 'Formulario en modo edición');
    assert(form.deudaId === deuda.id, 'ID de deuda cargado');

    // Usuario modifica las cuotas: mantiene el primero, elimina el segundo, agrega nuevo
    const keepCuotaId = deuda.cuotas[0].id;
    form.cuotas = [
        { id: keepCuotaId, cuota: 5000, moneda: 'ARS', vencimiento: '2026-03-10', pagado: false },
        { cuota: 12000, moneda: 'ARS', vencimiento: '2026-05-10', pagado: false }
    ];

    // Submit en modo edición
    let updatedEvent = null;
    form.addEventListener('deuda:updated', (e) => { updatedEvent = e; });
    await form.handleSubmit({
        preventDefault: () => {},
        detail: { acreedor: 'Visa Gold', tipoDeuda: 'Tarjeta', notas: 'Upgrade' }
    });

    assert(updatedEvent !== null, 'El componente debe emitir deuda:updated');

    // Verificar cambios en la DB
    const edited = await getDeuda(deuda.id);
    assert(edited.acreedor === 'Visa Gold', 'Acreedor actualizado a Visa Gold');
    assert(edited.notas === 'Upgrade', 'Notas actualizadas');
    assert(edited.cuotas.length === 2, 'Debe tener 2 cuotas (1 mantenido + 1 nuevo)');

    // Verificar que las cuotas reflejan la edicion
    const cuotasEditados = edited.cuotas;
    assert(cuotasEditados.some(m => m.cuota === 5000), 'Cuota mantenido: 5000');
    assert(cuotasEditados.some(m => m.cuota === 12000), 'Nuevo cuota: 12000');

    document.body.removeChild(form);
    await cleanup();
}

// ===================================================================
// UC3: Importar datos con merge (evitar duplicados)
// Flujo: usuario tiene una deuda existente, importa JSON que tiene
// la misma deuda con cuotas repetidos y nuevos. No debe duplicar.
// ===================================================================
async function testImportarConMerge() {
    console.log('  UC3: Importar datos con merge (sin duplicar cuotas)');
    await cleanup();

    // Deuda existente creada desde DebtForm
    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    form.cuotas = [
        { cuota: 50000, moneda: 'ARS', vencimiento: '2026-03-01', pagado: true },
        { cuota: 50000, moneda: 'ARS', vencimiento: '2026-04-01', pagado: false }
    ];
    await form.handleSubmit({
        preventDefault: () => {},
        detail: { acreedor: 'Banco Nacion', tipoDeuda: 'Hipotecario', notas: '' }
    });

    // Simular importacion: addOrMergeDeuda (como hace ImportDataModal)
    await addOrMergeDeuda({
        acreedor: 'Banco Nacion',
        tipoDeuda: 'Hipotecario',
        notas: '',
        cuotas: [
            { cuota: 50000, moneda: 'ARS', vencimiento: '2026-04-01', pagado: false }, // duplicado
            { cuota: 50000, moneda: 'ARS', vencimiento: '2026-05-01', pagado: false }  // nuevo
        ]
    });

    const deudas = await listDeudas();
    assert(deudas.length === 1, 'Merge: debe seguir siendo 1 deuda');
    assert(deudas[0].cuotas.length === 3, 'Merge: 2 originales + 1 nuevo = 3 cuotas');

    // Importar deuda con acreedor diferente: debe crear nueva
    await addOrMergeDeuda({
        acreedor: 'Banco Provincia',
        tipoDeuda: 'Personal',
        notas: '',
        cuotas: [{ cuota: 10000, moneda: 'ARS', vencimiento: '2026-06-01', pagado: false }]
    });
    const deudasFinal = await listDeudas();
    assert(deudasFinal.length === 2, 'Import nuevo acreedor: 2 deudas');

    document.body.removeChild(form);
    await cleanup();
}

// ===================================================================
// UC4: Eliminar deuda individual y eliminar todo
// Flujo: usuario tiene varias deudas, elimina una y sus cuotas
// desaparecen. Luego elimina todo.
// ===================================================================
async function testEliminarDeudas() {
    console.log('  UC4: Eliminar deuda individual y eliminar todo');
    await cleanup();

    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    // Crear deuda A
    form.cuotas = [{ cuota: 1000, moneda: 'ARS', vencimiento: '2026-03-01' }];
    await form.handleSubmit({
        preventDefault: () => {},
        detail: { acreedor: 'Deuda A', tipoDeuda: 'Servicio', notas: '' }
    });
    form.reset();

    // Crear deuda B
    form.cuotas = [
        { cuota: 2000, moneda: 'ARS', vencimiento: '2026-03-01' },
        { cuota: 3000, moneda: 'ARS', vencimiento: '2026-04-01' }
    ];
    await form.handleSubmit({
        preventDefault: () => {},
        detail: { acreedor: 'Deuda B', tipoDeuda: 'Prestamo', notas: '' }
    });

    let deudas = await listDeudas();
    let cuotas = await listCuotas();
    assert(deudas.length === 2, 'Inicio: 2 deudas');
    assert(cuotas.length === 3, 'Inicio: 3 cuotas totales');

    // Eliminar deuda A (importando deleteDeuda como haría el componente)
    const { deleteDeuda } = await import('../src/features/deudas/deudaRepository.js');
    const deudaA = deudas.find(d => d.acreedor === 'Deuda A');
    await deleteDeuda(deudaA.id);

    deudas = await listDeudas();
    cuotas = await listCuotas();
    assert(deudas.length === 1, 'Despues de borrar A: 1 deuda');
    assert(deudas[0].acreedor === 'Deuda B', 'La deuda restante es B');
    assert(cuotas.length === 2, 'Despues de borrar A: 2 cuotas');

    // Eliminar todo
    await deleteDeudas();
    deudas = await listDeudas();
    cuotas = await listCuotas();
    assert(deudas.length === 0, 'Despues de eliminar todo: 0 deudas');
    assert(cuotas.length === 0, 'Despues de eliminar todo: 0 cuotas');

    document.body.removeChild(form);
}

async function testDeleteDeudasWaitsForTransactionComplete() {
    console.log('  UC4b: deleteDeudas espera a que complete la transacción');
    await cleanup();

    await addOrMergeDeuda({
        acreedor: 'Consistencia',
        tipoDeuda: 'IndexedDB',
        notas: '',
        cuotas: [{ cuota: 1, moneda: 'ARS', vencimiento: '2026-03-01', pagado: false }]
    });

    const db = getDB();
    const originalTransaction = db.transaction.bind(db);
    let clearTransactionCompleted = false;

    db.transaction = (storeNames, mode, ...args) => {
        const transaction = originalTransaction(storeNames, mode, ...args);
        const names = Array.isArray(storeNames) ? storeNames : [storeNames];
        if (mode === 'readwrite' && names.includes('deudas') && names.includes('cuotas')) {
            transaction.addEventListener('complete', () => {
                clearTransactionCompleted = true;
            }, { once: true });
        }
        return transaction;
    };

    try {
        await deleteDeudas();
        assert(clearTransactionCompleted, 'deleteDeudas debe resolver despues del complete de IndexedDB');
    } finally {
        db.transaction = originalTransaction;
        await cleanup();
    }
}

// ===================================================================
// UC5: Multiples deudas con cuotas en el mismo mes
// Flujo: usuario crea 2 deudas distintas con cuotas en el mismo mes.
// Al consultar el mes, ve todos las cuotas y totales correctos.
// ===================================================================
async function testMultiplesDeudasMismoMes() {
    console.log('  UC5: Multiples deudas con cuotas en el mismo mes');
    await cleanup();

    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    // Deuda 1
    form.cuotas = [{ cuota: 8000, moneda: 'ARS', vencimiento: '2026-03-10', pagado: false }];
    await form.handleSubmit({
        preventDefault: () => {},
        detail: { acreedor: 'Edenor', tipoDeuda: 'Servicio', notas: '' }
    });
    form.reset();

    // Deuda 2
    form.cuotas = [
        { cuota: 5000, moneda: 'ARS', vencimiento: '2026-03-15', pagado: false },
        { cuota: 20, moneda: 'USD', vencimiento: '2026-03-15', pagado: true }
    ];
    await form.handleSubmit({
        preventDefault: () => {},
        detail: { acreedor: 'Personal', tipoDeuda: 'Servicio', notas: '' }
    });

    // Cada deuda tiene sus propios cuotas
    const deudas = await listDeudas();
    assert(deudas.length === 2, '2 deudas');
    const edenor = deudas.find(d => d.acreedor === 'Edenor');
    const personal = deudas.find(d => d.acreedor === 'Personal');
    assert(edenor.cuotas.length === 1, 'Edenor: 1 cuota');
    assert(personal.cuotas.length === 2, 'Personal: 2 cuotas');

    document.body.removeChild(form);
    await cleanup();
}

// ===================================================================
// UC6: DebtDetailModal muestra el detalle de una deuda con sus cuotas
// Flujo: se crea una deuda con cuotas, se abre el modal de detalle,
// y se verifica que renderiza la info correcta.
// ===================================================================
async function testDebtDetailModal() {
    console.log('  UC6: DebtDetailModal renderiza detalle de deuda');
    await cleanup();

    // Crear una deuda con dos cuotas
    const form = document.createElement('debt-form');
    document.body.appendChild(form);
    form.cuotas = [
        { cuota: 12000, moneda: 'ARS', vencimiento: '2026-05-10', pagado: false },
        { cuota: 50, moneda: 'USD', vencimiento: '2026-06-15', pagado: false }
    ];
    await form.handleSubmit({
        preventDefault: () => {},
        detail: { acreedor: 'Banco Nación', tipoDeuda: 'Hipoteca', notas: 'Cuota mensual' }
    });
    document.body.removeChild(form);

    // Obtener la deuda creada
    const deudas = await listDeudas();
    assert(deudas.length === 1, 'UC6: debe existir 1 deuda');
    const deuda = deudas[0];
    assert(deuda.cuotas.length === 2, 'UC6: la deuda tiene 2 cuotas');

    // Montar el componente DebtDetailModal
    const modal = document.createElement('debt-detail-modal');
    document.body.appendChild(modal);

    let detachedModalEl = null;
    try {
        // Abrir el detalle de la deuda
        await modal.openDetail(deuda);

        // UiModal mueve su .modal a document.body al abrirse,
        // por lo que buscamos el contenido directamente en document.body.
        detachedModalEl = document.body.querySelector('.modal');

        // Verificar que se renderizó el total pendiente
        const totalEl = document.body.querySelector('.fs-2');
        assert(totalEl !== null, 'UC6: debe mostrar el total pendiente prominente');

        // Verificar que la tabla de cuotas tiene las filas correctas
        const tbody = document.body.querySelector('#detail-cuotas-tbody');
        assert(tbody !== null, 'UC6: debe existir tbody de cuotas');
        assert(tbody && tbody.children.length === 2, 'UC6: debe mostrar 2 filas de cuotas');

        // Verificar que la tabla de cuotas NO tiene botones de acción (vista de solo lectura)
        const actionBtns = document.body.querySelectorAll('#detail-cuotas-tbody app-button');
        assert(actionBtns && actionBtns.length === 0, 'UC6: la vista detalle no debe mostrar botones de acción');
    } finally {
        if (detachedModalEl && detachedModalEl.parentNode) {
            detachedModalEl.parentNode.removeChild(detachedModalEl);
        }
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        await cleanup();
    }
}

// ===================================================================
// UC7: debtTableColumns acreedor render agrupa Acreedor y Tipo en mobile
// Verifica que la columna Acreedor renderiza el nombre con fw-semibold
// y un badge con el tipo de deuda visible solo en mobile (d-md-none).
// ===================================================================
async function testAcreedorColumnMobileRender() {
    console.log('  UC7: acreedor column renderiza badge de tipo para mobile');

    const acreedorCol = debtTableColumns.find(col => col.key === 'acreedor');
    assert(acreedorCol !== undefined, 'Debe existir columna acreedor');
    assert(typeof acreedorCol.render === 'function', 'Columna acreedor debe tener render function');

    const row = { acreedor: 'Banco Galicia', tipoDeuda: 'Préstamo' };
    const node = acreedorCol.render(row);
    assert(node instanceof Node, 'render debe devolver un nodo DOM');

    const acreedorSpan = node.querySelector('span.fw-semibold');
    assert(acreedorSpan !== null, 'Debe existir span con clase fw-semibold para el acreedor');
    assert(acreedorSpan.textContent === 'Banco Galicia', 'El span debe mostrar el nombre del acreedor');

    const badge = node.querySelector('span.badge');
    assert(badge !== null, 'Debe existir un badge para el tipo de deuda');
    assert(badge.classList.contains('rounded-pill'), 'Badge debe tener clase rounded-pill');
    assert(badge.classList.contains('text-bg-light'), 'Badge debe tener clase text-bg-light');
    assert(badge.classList.contains('d-md-none'), 'Badge debe tener clase d-md-none (solo visible en mobile)');
    assert(badge.textContent === 'Préstamo', 'Badge debe mostrar el tipo de deuda');

    const tipoCol = debtTableColumns.find(col => col.key === 'tipoDeuda');
    assert(tipoCol !== undefined, 'Debe existir columna tipoDeuda');
    assert(tipoCol.opts && typeof tipoCol.opts.classCss === 'string',
        'Columna Tipo debe definir classCss');
    assert(tipoCol.opts.classCss.includes('d-none'),
        'Columna Tipo debe incluir clase d-none para ocultarse en mobile');
    assert(tipoCol.opts.classCss.includes('d-md-table-cell'),
        'Columna Tipo debe incluir clase d-md-table-cell para mostrarse desde md');

    // Badge no debe renderizarse cuando tipoDeuda está vacío
    const rowSinTipo = { acreedor: 'Banco Sin Tipo', tipoDeuda: '' };
    const nodeSinTipo = acreedorCol.render(rowSinTipo);
    const badgeSinTipo = nodeSinTipo.querySelector('span.badge');
    assert(badgeSinTipo === null, 'No debe renderizarse badge cuando tipoDeuda está vacío');

    // Columna monedaycuota debe mostrar badge de vencimiento en mobile
    const cuotaCol = debtTableColumns.find(col => col.key === 'monedaycuota');
    assert(cuotaCol !== undefined, 'Debe existir columna monedaycuota');
    assert(typeof cuotaCol.render === 'function', 'Columna monedaycuota debe tener render function');

    const rowConVenc = { cuota: 1000, moneda: 'ARS', vencimiento: '2026-06-01' };
    const cuotaNode = cuotaCol.render(rowConVenc);
    assert(cuotaNode instanceof Node, 'monedaycuota render debe devolver un nodo DOM');

    // El span dla cuota debe tener text-nowrap para evitar corte del símbolo de moneda en mobile
    const cuotaSpan = cuotaNode.querySelector('span.text-nowrap');
    assert(cuotaSpan !== null, 'El span dla cuota debe tener clase text-nowrap');

    const vencBadge = cuotaNode.querySelector('span.d-md-none');
    assert(vencBadge !== null, 'Debe existir elemento de vencimiento en columna Cuota');
    assert(vencBadge.classList.contains('d-md-none'), 'Elemento de vencimiento debe ser solo visible en mobile (d-md-none)');
    // El span de vencimiento también debe tener text-nowrap para evitar corte de fechas ISO en mobile
    assert(vencBadge.classList.contains('text-nowrap'), 'Elemento de vencimiento debe tener clase text-nowrap');
    assert(vencBadge.textContent === '2026-06-01', 'Elemento debe mostrar la fecha de vencimiento');

    // Badge de vencimiento no debe renderizarse cuando vencimiento está vacío
    const rowSinVenc = { cuota: 500, moneda: 'ARS', vencimiento: '' };
    const cuotaNodeSinVenc = cuotaCol.render(rowSinVenc);
    const vencBadgeSinVenc = cuotaNodeSinVenc.querySelector('span.d-md-none');
    assert(vencBadgeSinVenc === null, 'No debe renderizarse elemento de vencimiento cuando está vacío');

    const today = new Date();
    const yyyyMmDd = (date) => date.toISOString().slice(0, 10);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const pagadoNode = cuotaCol.render({
        cuota: 1000,
        moneda: 'ARS',
        vencimiento: yyyyMmDd(tomorrow),
        pagado: true
    });
    const pagadoBadge = pagadoNode.querySelector('.badge.text-bg-success');
    assert(pagadoBadge !== null, 'Debe renderizar badge verde cuando la cuota está pagado');
    assert(pagadoBadge.textContent === 'Pagado', 'Badge verde debe mostrar "Pagado"');

    const vencidoNode = cuotaCol.render({
        cuota: 1000,
        moneda: 'ARS',
        vencimiento: yyyyMmDd(yesterday),
        pagado: false
    });
    const vencidoBadge = vencidoNode.querySelector('.badge.text-bg-danger');
    assert(vencidoBadge !== null, 'Debe renderizar badge rojo cuando está vencido y pendiente');
    assert(vencidoBadge.textContent === 'Vencido', 'Badge rojo debe mostrar "Vencido"');

    const venceHoyNode = cuotaCol.render({
        cuota: 1000,
        moneda: 'ARS',
        vencimiento: yyyyMmDd(today),
        pagado: false
    });
    const venceHoyBadge = venceHoyNode.querySelector('.badge.text-bg-warning');
    assert(venceHoyBadge !== null, 'Debe renderizar badge amarillo cuando vence hoy y está pendiente');
    assert(venceHoyBadge.textContent === 'Vence hoy', 'Badge amarillo debe mostrar "Vence hoy"');

    const pendienteNode = cuotaCol.render({
        cuota: 1000,
        moneda: 'ARS',
        vencimiento: yyyyMmDd(tomorrow),
        pagado: false
    });
    const pendienteBadge = pendienteNode.querySelector('.badge.text-bg-success, .badge.text-bg-danger, .badge.text-bg-warning');
    assert(pendienteBadge === null, 'No debe renderizar badge para pendiente sin vencer');
}

// ===================================================================
// UC7b: toggle pagado actualiza badge y muestra toast de feedback
// ===================================================================
async function testPagoToggleVisualFeedback() {
    console.log('  UC7b: toggle pagado actualiza badge y muestra toast');
    await cleanup();

    const future = new Date();
    future.setDate(future.getDate() + 2);
    const futureYmd = future.toISOString().slice(0, 10);

    const form = document.createElement('debt-form');
    document.body.appendChild(form);
    form.cuotas = [{ cuota: 999, moneda: 'ARS', vencimiento: futureYmd, pagado: false }];
    await form.handleSubmit({ preventDefault: () => {}, detail: { acreedor: 'Toggle Test', tipoDeuda: 'Prestamo', notas: '' } });
    document.body.removeChild(form);

    const [cuota] = await listCuotas({ mes: futureYmd.slice(0, 7) });
    assert(cuota, 'Debe existir una cuota para probar el toggle de pagado');

    const cuotaCol = debtTableColumns.find(col => col.key === 'monedaycuota');
    const accionesCol = debtTableColumns.find(col => col.key === 'acciones');
    const row = { ...cuota };
    let reloadCalls = 0;
    row._reload = () => { reloadCalls += 1; };

    const cuotaNode = cuotaCol.render(row);
    const accionesNode = accionesCol.render(row);
    document.body.appendChild(cuotaNode);
    document.body.appendChild(accionesNode);

    const notifications = [];
    const onNotify = (event) => notifications.push(event.detail);
    window.addEventListener('app:notify', onNotify);

    try {
        const input = accionesNode.querySelector('input[type="checkbox"]');
        assert(input !== null, 'Debe existir switch de pago');

        input.checked = true;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 50));

        assert(cuotaNode.querySelector('.badge.text-bg-success') !== null, 'Al marcar pago debe mostrarse badge Pagado');
        assert(notifications.some(n => n.type === 'success'), 'Al marcar pago debe mostrarse toast verde');

        input.checked = false;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 50));

        assert(cuotaNode.querySelector('.badge.text-bg-success') === null, 'Al desmarcar pago debe quitarse badge Pagado');
        const pendingStateBadge = cuotaNode.querySelector('.badge.text-bg-danger, .badge.text-bg-warning');
        assert(pendingStateBadge === null, 'Pendiente sin vencer no debe mostrar badge');
        assert(notifications.some(n => n.type === 'warning'), 'Al desmarcar pago debe mostrarse toast amarillo');
        assert(reloadCalls >= 2, 'El toggle pagado debe disparar recarga luego de persistir cambios');
    } finally {
        window.removeEventListener('app:notify', onNotify);
        if (cuotaNode.parentNode) document.body.removeChild(cuotaNode);
        if (accionesNode.parentNode) document.body.removeChild(accionesNode);
        await cleanup();
    }
}

// ===================================================================
// UC8: Alta inline — openInlineAdd() muestra sólo el formulario de cuota
// Verifica estados de visibilidad: en creating se ocultan tabla y botón Agregar cuota.
// Al guardar con datos válidos, form.cuotas crece en 1 y vuelve el modo lista.
// ===================================================================
async function testAltaInlineAgregarYGuardar() {
    console.log('  UC8: Alta inline — agregar cuota y guardar');
    await cleanup();

    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    assert(form._inlineEditIdx === null, 'Sin inline al iniciar');

    // Abrir inline add
    form.openInlineAdd();
    assert(form._amountMode === 'creating', '_amountMode debe ser "creating"');
    assert(form._inlineEditIdx === 'new', '_inlineEditIdx debe ser "new"');

    const tableWrapper = form.querySelector('#cuotas-table-wrapper');
    const addCuotaBtnRow = form.querySelector('#add-cuota-btn-row');
    const title = form.querySelector('#cuota-form-title');
    const inlineAddContainer = form.querySelector('#add-cuota-form-container');
    assert(inlineAddContainer !== null, 'Debe existir contenedor separado para alta de cuota');
    assert(!inlineAddContainer.classList.contains('d-none'), 'El formulario de alta debe estar visible');
    assert(tableWrapper.classList.contains('d-none'), 'La tabla/lista debe ocultarse al crear');
    assert(addCuotaBtnRow.classList.contains('d-none'), 'El botón Agregar cuota debe ocultarse al crear');
    assert(title.textContent === 'Nuevo cuota', 'El formulario debe titularse "Nuevo cuota"');
    let inlineForm = inlineAddContainer.querySelector('cuota-form');
    assert(inlineForm !== null, 'Debe haber un formulario inline de alta');

    // Verify inputs exist inside cuota-form > app-form
    const appFormEl = inlineForm.querySelector('app-form form');
    const fieldsRow = appFormEl.firstElementChild;
    const generalFeedback = appFormEl.querySelector('[data-cuota-general-error="true"]');
    const actionRow = appFormEl.querySelector('[data-form-actions="true"]');
    const cancelBtn = actionRow.querySelector('#cancelBtn');
    const saveBtn = actionRow.querySelector('button[type="submit"]');
    assert(!appFormEl.classList.contains('flex-md-row'), 'El formulario inline no debe forzar flex-md-row');
    assert(fieldsRow.classList.contains('row'), 'La primera fila inline debe contener los campos');
    assert(generalFeedback?.previousElementSibling === fieldsRow, 'El mensaje general debe ir debajo de la fila de campos');
    assert(generalFeedback?.nextElementSibling === actionRow, 'Las acciones deben ir debajo del mensaje general');
    assert(actionRow?.classList.contains('justify-content-end'), 'Las acciones inline deben alinearse a la derecha');
    assert(actionRow?.classList.contains('mt-3'), 'Las acciones inline deben separarse visualmente de los campos');
    assert(cancelBtn?.classList.contains('btn-outline-secondary'), 'Cancelar inline debe verse como acción secundaria');
    assert(saveBtn?.classList.contains('btn-success'), 'Guardar inline debe mantenerse como acción primaria verde');
    const cuotaInput = inlineForm.querySelector('input[name="cuota"]');
    const monedaSelect = inlineForm.querySelector('select[name="moneda"]');
    const vencInput = inlineForm.querySelector('input[name="vencimiento"]');
    assert(cuotaInput !== null && monedaSelect !== null && vencInput !== null, 'Inputs del inline presentes');

    // Guardar via form:submit directo (mismo patrón que cuotas.test.js UC1)
    inlineForm.querySelector('app-form').dispatchEvent(new CustomEvent('form:submit', {
        detail: { cuota: '7500', moneda: 'ARS', vencimiento: '2026-07-15' },
        bubbles: true,
        composed: true
    }));
    assert(form._amountMode === 'idle', 'Debe volver a modo lista tras guardar');
    assert(form._inlineEditIdx === null, 'Inline cerrado tras guardar');
    assert(form.cuotas.length === 1, 'cuotas debe tener 1 elemento tras guardar');
    assert(form.cuotas[0].cuota === 7500, 'Cuota guardado: 7500');
    assert(form.cuotas[0].moneda === 'ARS', 'Moneda guardada: ARS');
    assert(form.cuotas[0].vencimiento === '2026-07-15', 'Vencimiento guardado');
    assert(form.cuotas[0].pagado === false, 'pagado = false por defecto');

    // El formulario inline ya no debe estar presente
    inlineForm = inlineAddContainer.querySelector('cuota-form');
    assert(inlineForm === null, 'Formulario inline desaparecido tras guardar');
    assert(inlineAddContainer.classList.contains('d-none'), 'El contenedor de alta vuelve a ocultarse tras guardar');
    assert(!tableWrapper.classList.contains('d-none'), 'La tabla/lista vuelve a mostrarse tras guardar');
    assert(!addCuotaBtnRow.classList.contains('d-none'), 'El botón Agregar cuota vuelve a mostrarse tras guardar');

    document.body.removeChild(form);
    await cleanup();
}

// ===================================================================
// UC8b: Alta inline — marca campos inválidos y muestra error general corto
// ===================================================================
async function testAltaInlineValidacionErrores() {
    console.log('  UC8b: Alta inline — muestra errores ARIA cuando campos están vacíos');
    await cleanup();

    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    form.openInlineAdd();
    const inlineAddContainer = form.querySelector('#add-cuota-form-container');
    const inlineForm = inlineAddContainer.querySelector('cuota-form');
    assert(inlineForm !== null, 'Debe haber un formulario inline de alta');

    const cuotaInput = inlineForm.querySelector('input[name="cuota"]');
    const vencInput = inlineForm.querySelector('input[name="vencimiento"]');
    const appForm = inlineForm.querySelector('app-form');

    // Intentar guardar con campos vacíos — AppForm fires invalid events, not is-invalid class
    appForm.triggerSubmit();
    assert(form._inlineEditIdx === 'new', 'El inline sigue abierto tras guardar con campos inválidos');
    assert(form.cuotas.length === 0, 'No se agregó ningún cuota');
    assert(cuotaInput.getAttribute('aria-invalid') === 'true', 'Cuota debe tener aria-invalid=true');
    assert(vencInput.getAttribute('aria-invalid') === 'true', 'Vencimiento debe tener aria-invalid=true');
    const generalFeedback = appForm.querySelector('[data-cuota-general-error="true"]');
    assert(generalFeedback !== null, 'Debe existir mensaje general de validación');
    assert(generalFeedback.classList.contains('d-block'), 'El mensaje general de validación debe mostrarse');
    assert(generalFeedback.textContent === CUOTA_FORM_GENERAL_ERROR_MESSAGE, 'El mensaje general debe ser corto y claro');

    document.body.removeChild(form);
    await cleanup();
}

// ===================================================================
// UC9: Cancel alta inline — no modifica form.cuotas ni deja fila basura
// ===================================================================
async function testCancelarAltaInline() {
    console.log('  UC9: Cancel alta inline — no modifica cuotas');
    await cleanup();

    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    // Pre-cargar una cuota ya confirmado
    form.cuotas = [{ cuota: 5000, moneda: 'ARS', vencimiento: '2026-06-01', pagado: false }];
    form.renderCuotasList();

    form.openInlineAdd();
    assert(form._inlineEditIdx === 'new', 'Inline add abierto');
    assert(form._amountMode === 'creating', 'Debe quedar en modo creating');

    form._cancelInline();
    assert(form._amountMode === 'idle', 'Debe volver a modo idle tras cancelar');
    assert(form._inlineEditIdx === null, 'Inline cerrado tras cancelar');
    assert(form.cuotas.length === 1, 'cuotas sigue con 1 elemento (sin cambios)');
    assert(form.cuotas[0].cuota === 5000, 'La cuota original no fue modificado');

    const inlineForm = form.querySelector('#add-cuota-form-container cuota-form');
    assert(inlineForm === null, 'No hay formulario inline tras cancelar');

    document.body.removeChild(form);
    await cleanup();
}

// ===================================================================
// UC10: Edición inline — openInlineEdit() precarga valores y guardar actualiza cuotas
// ===================================================================
async function testEdicionInlineGuardar() {
    console.log('  UC10: Edición inline — editar y guardar');
    await cleanup();

    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    form.cuotas = [
        { cuota: 1000, moneda: 'ARS', vencimiento: '2026-05-10', pagado: false },
        { cuota: 2000, moneda: 'USD', vencimiento: '2026-06-10', pagado: false }
    ];
    form.renderCuotasList();

    // Editar el primer cuota (idx=0 después de ordenar por vencimiento)
    form.openInlineEdit(form.cuotas[0], 0);
    assert(form._inlineEditIdx === 0, '_inlineEditIdx = 0');
    assert(form._inlineEditRef !== null, '_inlineEditRef cargado');
    assert(form._inlineEditRef.cuota === 1000, 'Original guardado: 1000');

    assert(form._amountMode === 'editing', 'Debe quedar en modo editing');
    const inlineContainer = form.querySelector('#add-cuota-form-container');
    const inlineRow = inlineContainer.querySelector('cuota-form');
    assert(inlineRow !== null, 'Formulario inline presente para edición');
    assert(form.querySelector('#cuota-form-title').textContent === 'Editar cuota', 'Debe usar título "Editar cuota"');
    assert(form.querySelector('#cuotas-table-wrapper').classList.contains('d-none'), 'La tabla debe ocultarse durante edición');
    assert(form.querySelector('#add-cuota-btn-row').classList.contains('d-none'), 'El botón Agregar cuota debe ocultarse durante edición');

    const cuotaInput = inlineRow.querySelector('input[name="cuota"]');
    assert(cuotaInput.value === '1000', 'Input cuota precargado con 1000');

    // Modificar el valor
    cuotaInput.value = '1500';
    const vencInput = inlineRow.querySelector('input[name="vencimiento"]');
    vencInput.value = '2026-05-10';
    const monedaSelect = inlineRow.querySelector('select[name="moneda"]');
    monedaSelect.value = 'ARS';

    inlineRow.querySelector('app-form').dispatchEvent(new CustomEvent('form:submit', {
        detail: { cuota: '1500', moneda: 'ARS', vencimiento: '2026-05-10' },
        bubbles: true,
        composed: true
    }));
    assert(form._amountMode === 'idle', 'Debe volver a modo lista tras guardar edición');
    assert(form._inlineEditIdx === null, 'Inline cerrado tras guardar');
    assert(form.cuotas.length === 2, 'Sigue con 2 cuotas');

    // Verificar que la cuota fue actualizado
    const cuotaActualizado = form.cuotas.find(m => m.vencimiento === '2026-05-10');
    assert(cuotaActualizado !== undefined, 'Cuota de mayo sigue presente');
    assert(cuotaActualizado.cuota === 1500, 'Cuota actualizado a 1500');

    document.body.removeChild(form);
    await cleanup();
}

// ===================================================================
// UC11: Cancelar edición inline — revierte valores, cuotas sin cambios
// ===================================================================
async function testCancelarEdicionInline() {
    console.log('  UC11: Cancelar edición inline — revierte sin cambios');
    await cleanup();

    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    form.cuotas = [{ cuota: 9000, moneda: 'ARS', vencimiento: '2026-08-01', pagado: false }];
    form.renderCuotasList();

    form.openInlineEdit(form.cuotas[0], 0);

    // Modificar inputs pero cancelar sin guardar
    const inlineRow = form.querySelector('#add-cuota-form-container cuota-form');
    inlineRow.querySelector('input[name="cuota"]').value = '99999';

    form._cancelInline();

    assert(form._amountMode === 'idle', 'Cancelar edición vuelve a modo lista');
    assert(form._inlineEditIdx === null, 'Inline cerrado tras cancelar');
    assert(form.cuotas.length === 1, 'Sigue con 1 cuota');
    assert(form.cuotas[0].cuota === 9000, 'Cuota original sin cambios: 9000');

    document.body.removeChild(form);
    await cleanup();
}

// ===================================================================
// UC12: Regla "solo 1 inline" — confirm(true) descarta el actual y abre nuevo
// ===================================================================
async function testSoloUnInlineAbierto() {
    console.log('  UC12: Regla solo 1 inline — confirm descarta y abre nuevo');
    await cleanup();

    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    form.cuotas = [
        { cuota: 100, moneda: 'ARS', vencimiento: '2026-03-01', pagado: false },
        { cuota: 200, moneda: 'ARS', vencimiento: '2026-04-01', pagado: false }
    ];
    form.renderCuotasList();

    // Abrir inline en el primer cuota
    form.openInlineEdit(form.cuotas[0], 0);
    assert(form._inlineEditIdx === 0, 'Primer inline abierto en idx 0');

    // Simular confirm = true (usuario acepta descartar cambios)
    const origConfirm = global.confirm;
    global.confirm = () => true;
    try {
        // Intentar abrir inline en el segundo cuota
        form.openInlineEdit(form.cuotas[1], 1);
        assert(form._inlineEditIdx === 1, 'Con confirm=true, nuevo inline abierto en idx 1');
    } finally {
        global.confirm = origConfirm;
    }

    // Simular confirm = false (usuario rechaza descartar cambios)
    form._cancelInline(); // cerrar el inline actual primero
    form.openInlineEdit(form.cuotas[0], 0);
    assert(form._inlineEditIdx === 0, 'Inline abierto en idx 0');

    global.confirm = () => false;
    try {
        form.openInlineEdit(form.cuotas[1], 1);
        assert(form._inlineEditIdx === 0, 'Con confirm=false, inline original sigue en idx 0');
    } finally {
        global.confirm = origConfirm;
    }

    document.body.removeChild(form);
    await cleanup();
}

// ===================================================================
// UC13: Duplicar cuota inline — copia datos, pagado=false, sin modal
// ===================================================================
async function testDuplicarCuotaInline() {
    console.log('  UC13: Duplicar cuota inline — pagado=false, sin abrir modal');
    await cleanup();

    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    form.cuotas = [{
        id: 42, cuota: 5000, moneda: 'USD', vencimiento: '2026-09-01', pagado: true
    }];
    form.renderCuotasList();

    // No debe haber cuotaModal ni duplicateCuotaModal en el DOM
    assert(form.querySelector('#cuotaModal') === null, 'No hay #cuotaModal');
    assert(form.querySelector('#duplicateCuotaModal') === null, 'No hay #duplicateCuotaModal');

    form.duplicateCuota(form.cuotas[0]);

    assert(form.cuotas.length === 2, 'Debe haber 2 cuotas tras duplicar');
    const dupl = form.cuotas.find(m => !Object.prototype.hasOwnProperty.call(m, 'id'));
    assert(dupl !== undefined, 'El duplicado no tiene id');
    assert(dupl.cuota === 5000, 'Cuota copiado: 5000');
    assert(dupl.moneda === 'USD', 'Moneda copiada: USD');
    assert(dupl.vencimiento === '2026-09-01', 'Vencimiento copiado');
    assert(dupl.pagado === false, 'pagado forzado a false en el duplicado');

    document.body.removeChild(form);
    await cleanup();
}

// ===================================================================
// UC14: No se usan modales secundarios en el flujo Deuda → Cuotas
// Verifica que DebtForm NO tiene cuotaModal ni duplicateCuotaModal.
// ===================================================================
async function testNoModalSecundarioEnDebtForm() {
    console.log('  UC14: DebtForm no abre modales para cuotas (sin modals apilados)');

    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    assert(form.querySelector('#cuotaModal') === null, 'No debe existir #cuotaModal en DebtForm');
    assert(form.querySelector('#duplicateCuotaModal') === null, 'No debe existir #duplicateCuotaModal en DebtForm');
    assert(typeof form.openInlineAdd === 'function', 'Debe existir método openInlineAdd');
    assert(typeof form.openInlineEdit === 'function', 'Debe existir método openInlineEdit');
    assert(typeof form.duplicateCuota === 'function', 'Debe existir método duplicateCuota');
    assert(typeof form.openCuotaModal === 'undefined', 'openCuotaModal ya no debe existir');
    assert(typeof form.openDuplicateCuotaModal === 'undefined', 'openDuplicateCuotaModal ya no debe existir');

    document.body.removeChild(form);
}

// ===================================================================
// UC15: DebtForm no tiene botones dentro del formulario cuando hideButtons=true
// Verifica que DebtForm usa hideButtons=true en AppForm (botones en footer del modal)
// ===================================================================
async function testDebtFormHideButtons() {
    console.log('  UC15: DebtForm oculta los botones del AppForm (van al footer del modal)');

    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    const appForm = form.querySelector('app-form');
    assert(appForm !== null, 'Debe existir app-form dentro de debt-form');
    assert(appForm.hideButtons === true, 'AppForm debe tener hideButtons=true');
    assert(appForm.querySelector('#cancelBtn') === null, 'No debe haber botón cancelar dentro de app-form');
    assert(appForm.querySelector('[data-programmatic-submit="true"]') !== null, 'Debe existir un submit programático oculto para el footer del modal');

    document.body.removeChild(form);
}

async function testDebtFormLayoutMobileFirst() {
    console.log('  UC15b: DebtForm ordena Acreedor, Tipo, Cuotas y Notas');

    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    const acreedorField = form.querySelector('[data-field-name="acreedor"]');
    const tipoField = form.querySelector('[data-field-name="tipoDeuda"]');
    const cuotasList = form.querySelector('.cuotas-list');
    const appForm = form.querySelector('app-form');
    const notasField = appForm.querySelector('[data-field-name="notas"]');
    const addCuotaBtn = cuotasList.querySelector('#add-cuota');
    const cuotasLabel = cuotasList.querySelector('#cuotas-label');
    const cuotasFieldContainer = cuotasList.querySelector('#cuotas-field');
    const cuotasTableWrapper = cuotasList.querySelector('#cuotas-table-wrapper');
    const cuotasRequiredMark = cuotasLabel?.querySelector('.text-danger');
    const tipoInput = tipoField.querySelector('input[name="tipoDeuda"]');

    assert(form.firstElementChild === acreedorField, 'Acreedor debe quedar antes del bloque de cuotas');
    assert(acreedorField.nextElementSibling === tipoField, 'Tipo de deuda debe ir después de Acreedor');
    assert(tipoField.nextElementSibling === cuotasList, 'Cuotas debe ir después de Tipo de deuda');
    assert(form.lastElementChild === appForm, 'Notas debe quedar después del bloque de cuotas');
    assert(tipoField !== null && notasField !== null, 'Tipo y Notas deben seguir existiendo');
    assert(!tipoField.classList.contains('card'), 'Tipo de deuda debe mantenerse como campo normal del formulario');
    assert(cuotasFieldContainer !== null, 'Cuotas debe tener un contenedor principal propio');
    assert(cuotasTableWrapper !== null, 'Cuotas debe tener un wrapper específico para la tabla');
    assert(cuotasTableWrapper.classList.contains('border'), 'La tabla de Cuotas debe usar borde Bootstrap como campo compuesto');
    assert(cuotasTableWrapper.classList.contains('rounded'), 'La tabla de Cuotas debe usar el mismo criterio de radio que el formulario');
    assert(addCuotaBtn.parentElement !== null, 'Agregar cuota debe tener contenedor dentro del footer del panel');
    assert(addCuotaBtn.parentElement.classList.contains('d-flex'), 'Agregar cuota debe quedar alineado dentro del footer del panel');
    assert(cuotasLabel?.textContent.includes('Cuotas'), 'Cuotas debe tener label visible');
    assert(cuotasLabel?.classList.contains('form-label'), 'El label de Cuotas debe usar el mismo estilo base del formulario');
    assert(cuotasRequiredMark?.textContent === '*', 'Cuotas debe mostrar asterisco de campo obligatorio');
    assert(tipoInput.getAttribute('aria-describedby') !== 'tipoDeuda-error', 'Tipo de deuda no debe renderizarse como panel con error custom');

    document.body.removeChild(form);
}

async function testDebtFormCampoReordenadoMuestraEstadoInvalido() {
    console.log('  UC15c: DebtForm muestra estado inválido en Acreedor reordenado');

    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    form.load({
        id: 1,
        acreedor: 'Visa',
        tipoDeuda: 'Tarjeta',
        notas: '',
        cuotas: [{ cuota: 1000, moneda: 'ARS', vencimiento: '2026-04-01', pagado: false }]
    });

    const appForm = form.querySelector('app-form');
    const acreedorField = form.querySelector('[data-field-name="acreedor"]');
    const acreedorInput = acreedorField.querySelector('input[name="acreedor"]');

    acreedorInput.value = '';
    appForm.triggerSubmit();

    assert(acreedorField.classList.contains('was-validated'), 'Acreedor reordenado debe recibir estado visual inválido');

    acreedorInput.value = 'Visa corregida';
    acreedorInput.dispatchEvent(new Event('input', { bubbles: true }));

    assert(!acreedorField.classList.contains('was-validated'), 'El estado visual inválido debe limpiarse al corregir Acreedor');

    document.body.removeChild(form);
}

async function testDebtFormTipoDeudaEsObligatorio() {
    console.log('  UC15d: DebtForm requiere Tipo de deuda con validación nativa');

    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    form.cuotas = [{ cuota: 1000, moneda: 'ARS', vencimiento: '2026-04-01', pagado: false }];

    const appForm = form.querySelector('app-form');
    const acreedorInput = form.querySelector('[data-field-name="acreedor"] input[name="acreedor"]');
    const tipoField = form.querySelector('[data-field-name="tipoDeuda"]');
    const tipoInput = tipoField.querySelector('input[name="tipoDeuda"]');
    const nativeForm = appForm.querySelector('form');

    let debtSubmitCount = 0;
    appForm.addEventListener('deuda:submit', () => {
        debtSubmitCount += 1;
    });

    acreedorInput.value = 'Visa';
    tipoInput.value = '';
    appForm.triggerSubmit();

    assert(tipoInput.required === true, 'Tipo de deuda debe ser required');
    assert(nativeForm.classList.contains('was-validated'), 'El formulario debe marcarse como validado en submit inválido');
    assert(tipoField.classList.contains('was-validated'), 'Tipo de deuda reordenado debe recibir estado visual inválido');
    assert(!tipoField.classList.contains('card'), 'Tipo de deuda debe seguir siendo un campo normal del formulario');
    assert(debtSubmitCount === 0, 'No debe emitirse deuda:submit cuando Tipo de deuda está vacío');

    document.body.removeChild(form);
}

// ===================================================================
// UC16: showFormError muestra el error cerca de la sección de Cuotas
// ===================================================================
async function testShowFormErrorNearCuotas() {
    console.log('  UC16: showFormError inserta el mensaje cerca de la sección Cuotas');

    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    form.showFormError(form.getCuotasRequiredError());

    const errEl = form.querySelector('#form-error');
    assert(errEl !== null, 'Debe existir el elemento #form-error');
    assert(errEl.textContent === form.getCuotasRequiredError(), 'El mensaje de error debe ser correcto');

    const cuotasList = form.querySelector('.cuotas-list');
    const cuotasFieldContainer = form.querySelector('#cuotas-field');
    const cuotasTableWrapper = form.querySelector('#cuotas-table-wrapper');
    assert(cuotasList !== null, 'Debe existir .cuotas-list');
    assert(cuotasList.contains(errEl), 'El error debe renderizarse dentro del bloque de cuotas');
    assert(errEl.parentElement === cuotasFieldContainer, 'El error debe renderizarse dentro del contenedor principal de Cuotas');
    assert(errEl.previousElementSibling === cuotasTableWrapper, 'El error debe aparecer debajo del wrapper de la tabla de cuotas');
    const cuotaFormTitle = form.querySelector('#cuota-form-title');
    const cuotaFormContainer = form.querySelector('#add-cuota-form-container');
    const addCuotaBtn = form.querySelector('#add-cuota');
    assert(errEl.nextElementSibling === cuotaFormTitle, 'El título del formulario de cuota debe quedar debajo del mensaje de error');
    assert(cuotaFormTitle.nextElementSibling === cuotaFormContainer, 'El contenedor del formulario de alta debe quedar debajo del título');
    assert(cuotaFormContainer.nextElementSibling?.querySelector('#add-cuota') === addCuotaBtn, 'El botón Agregar cuota debe quedar debajo del mensaje de error y del formulario de alta');
    assert(cuotasTableWrapper.classList.contains('border-danger'), 'Solo la tabla de Cuotas debe marcarse visualmente como inválida');
    assert(!cuotasFieldContainer.classList.contains('border-danger'), 'El contenedor general de Cuotas no debe marcarse en rojo');
    assert(!errEl.classList.contains('d-none'), 'El mensaje de error de cuotas debe hacerse visible');

    document.body.removeChild(form);
}

async function testDebtFormRequiereCuotasAlEnviar() {
    console.log('  UC16b: DebtForm marca error visible si se envía sin cuotas');

    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    const appForm = form.querySelector('app-form');
    const acreedorInput = form.querySelector('[data-field-name="acreedor"] input[name="acreedor"]');
    const tipoInput = form.querySelector('[data-field-name="tipoDeuda"] input[name="tipoDeuda"]');
    const cuotasFieldContainer = form.querySelector('#cuotas-field');
    const cuotasTableWrapper = form.querySelector('#cuotas-table-wrapper');
    const errEl = form.querySelector('#form-error');

    acreedorInput.value = 'Visa';
    tipoInput.value = 'Tarjeta';
    appForm.triggerSubmit();

    assert(errEl.textContent === form.getCuotasRequiredError(), 'Debe mostrar error cuando faltan cuotas');
    assert(cuotasTableWrapper.classList.contains('border-danger'), 'La tabla de Cuotas debe marcarse visualmente al enviar sin cuotas');
    assert(!cuotasFieldContainer.classList.contains('border-danger'), 'El bloque general de Cuotas no debe quedar en rojo al enviar sin cuotas');

    document.body.removeChild(form);
}

// ===================================================================
// UC17: DebtModal cierra el modal al cancelar desde el footer
// Verifica que form:cancel disparado desde app-form cierra el modal
// ===================================================================
async function testDebtModalCancelClosesModal() {
    console.log('  UC17: DebtModal cierra el modal al dispararse form:cancel');

    const modal = document.createElement('debt-modal');
    document.body.appendChild(modal);

    // Simulate form:cancel bubbling from app-form up through debt-form
    const debtForm = modal.querySelector('debt-form');
    assert(debtForm !== null, 'Debe existir debt-form dentro de debt-modal');

    let closed = false;
    const origClose = modal.ui.close.bind(modal.ui);
    modal.ui.close = () => { closed = true; origClose(); };

    debtForm.dispatchEvent(new CustomEvent('form:cancel', { bubbles: true, composed: true }));

    assert(closed === true, 'El modal debe cerrarse cuando se dispara form:cancel');

    modal.ui.close = origClose;
    document.body.removeChild(modal);
}

// ===================================================================
// UC17b: Cancelar cuota inline no debe cerrar el DebtModal
// ===================================================================
async function testDebtModalInlineCuotaCancelDoesNotCloseModal() {
    console.log('  UC17b: Cancelar cuota inline no cierra el modal de deuda');

    const modal = document.createElement('debt-modal');
    document.body.appendChild(modal);
    await new Promise(resolve => setTimeout(resolve, 0));

    let closeCalls = 0;
    const origClose = modal.ui.close.bind(modal.ui);
    modal.ui.close = () => { closeCalls += 1; };

    const debtForm = modal.querySelector('debt-form');
    debtForm.openInlineAdd();
    const inlineCuotaForm = debtForm.querySelector('#add-cuota-form-container app-form');
    const inlineActionRow = inlineCuotaForm?.querySelector('[data-form-actions="true"]');
    const inlineCancelBtn = inlineActionRow?.querySelector('#cancelBtn');
    const inlineSaveBtn = inlineActionRow?.querySelector('button[type="submit"]');
    const footerCancelBtn = modal.querySelector('.modal-footer .btn.btn-primary');
    const footerSaveBtn = modal.querySelector('.modal-footer .btn.btn-success');
    assert(inlineCuotaForm !== null, 'Debe existir app-form inline para cancelar cuota');
    assert(inlineCancelBtn?.classList.contains('btn-sm'), 'Cancelar dla cuota inline debe usar tamaño chico');
    assert(inlineSaveBtn?.classList.contains('btn-sm'), 'Guardar dla cuota inline debe usar tamaño chico');
    assert(!footerCancelBtn?.classList.contains('btn-sm'), 'Cancelar del footer del modal no debe usar tamaño chico');
    assert(!footerSaveBtn?.classList.contains('btn-sm'), 'Guardar del footer del modal no debe usar tamaño chico');

    inlineCuotaForm.dispatchEvent(new CustomEvent('form:cancel', { bubbles: true, composed: true }));

    assert(closeCalls === 0, 'Cancelar la cuota inline no debe cerrar el modal de deuda');
    assert(debtForm._inlineEditIdx === null, 'Cancelar cuota inline debe cerrar sólo la fila inline');

    modal.ui.close = origClose;
    document.body.removeChild(modal);
}

async function testDebtModalFooterUxValidacionConsistente() {
    console.log('  UC18: DebtModal mantiene Guardar habilitado y valida al enviar desde el footer');

    const modal = document.createElement('debt-modal');
    document.body.appendChild(modal);
    await new Promise(resolve => setTimeout(resolve, 0));

    const appForm = modal.querySelector('app-form');
    const nativeForm = appForm.querySelector('form');
    const acreedorField = modal.querySelector('[data-field-name="acreedor"]');
    const cuotasTableWrapper = modal.querySelector('#cuotas-table-wrapper');
    const formError = modal.querySelector('#form-error');
    const saveBtn = modal.querySelector('.modal-footer .btn.btn-success');

    assert(saveBtn !== null, 'Debe existir botón Guardar en el footer del modal de deuda');
    assert(saveBtn.disabled === false, 'El botón Guardar de deuda debe iniciar habilitado');
    assert(!nativeForm.classList.contains('was-validated'), 'No debe mostrar errores antes del primer envío en deuda');

    saveBtn.click();

    assert(nativeForm.classList.contains('was-validated'), 'Debe marcar el formulario al intentar guardar vacío desde el footer');
    assert(acreedorField.classList.contains('was-validated'), 'Acreedor debe mostrar el estado inválido recién después del envío');
    assert(formError.textContent === modal.querySelector('debt-form').getCuotasRequiredError(), 'Cuotas debe mostrar error también cuando el formulario está vacío');
    assert(cuotasTableWrapper.classList.contains('border-danger'), 'La tabla de Cuotas debe marcarse visualmente cuando se intenta guardar vacío');

    document.body.removeChild(modal);
}

async function testDebtModalReopenClearsValidationState() {
    console.log('  UC19: DebtModal limpia estados inválidos al reabrirse');

    const modal = document.createElement('debt-modal');
    document.body.appendChild(modal);
    await new Promise(resolve => setTimeout(resolve, 0));

    const debtForm = modal.form;
    const appForm = debtForm.querySelector('app-form');
    appForm.triggerSubmit();

    let nativeForm = debtForm.querySelector('app-form form');
    let acreedorField = debtForm.querySelector('[data-debt-form-field="acreedor"]');
    let cuotasTableWrapper = debtForm.querySelector('#cuotas-table-wrapper');
    let formError = debtForm.querySelector('#form-error');

    assert(nativeForm.classList.contains('was-validated'), 'Debe marcar el form inválido antes de reabrir');
    assert(acreedorField.classList.contains('was-validated'), 'Acreedor debe marcarse inválido antes de reabrir');
    assert(cuotasTableWrapper.classList.contains('border-danger'), 'La tabla de Cuotas debe marcarse inválida antes de reabrir');
    assert(formError.textContent === debtForm.getCuotasRequiredError(), 'Debe existir error de cuotas antes de reabrir');

    modal.close();
    modal.openCreate();
    await new Promise(resolve => setTimeout(resolve, 0));

    nativeForm = debtForm.querySelector('app-form form');
    acreedorField = debtForm.querySelector('[data-debt-form-field="acreedor"]');
    cuotasTableWrapper = debtForm.querySelector('#cuotas-table-wrapper');
    formError = debtForm.querySelector('#form-error');

    assert(!nativeForm.classList.contains('was-validated'), 'No debe persistir was-validated al reabrir el modal');
    assert(!acreedorField.classList.contains('was-validated'), 'Acreedor no debe conservar estado inválido al reabrir');
    assert(!cuotasTableWrapper.classList.contains('border-danger'), 'La tabla de Cuotas no debe conservar borde de error al reabrir');
    assert(formError.textContent === '', 'El error de cuotas debe limpiarse al reabrir');

    document.body.removeChild(modal);
}

// ===================================================================
// UC-DS1: DebtEntityShell – render vacío
// ===================================================================
async function testDebtEntityShellRenderVacio() {
    console.log('  DebtEntityShell: muestra mensaje cuando no hay deudas');
    await cleanup();

    window.history.pushState({}, '', '/gastos/deudas');
    const shell = document.createElement('debt-entity-shell');
    document.body.appendChild(shell);
    await shell.loadEntities();

    const container = shell.querySelector('#entity-table-container');
    assert(container !== null, 'DebtEntityShell debe tener #entity-table-container en vista deudas');
    assert(container.textContent.includes('No hay deudas registradas'), 'Debe mostrar mensaje vacío cuando no hay deudas');

    document.body.removeChild(shell);
    window.history.pushState({}, '', '/');
    await cleanup();
}

// ===================================================================
// UC-DS2: DebtEntityShell – render con entidades
// ===================================================================
async function testDebtEntityShellRenderConEntidades() {
    console.log('  DebtEntityShell: muestra tabla con filas al haber deudas');
    await cleanup();

    // Crear una deuda directamente usando el formulario
    const form = document.createElement('debt-form');
    document.body.appendChild(form);
    form.cuotas = [{ cuota: 10000, moneda: 'ARS', vencimiento: '2026-03-01', pagado: false }];
    await form.handleSubmit({ preventDefault: () => {}, detail: { acreedor: 'Banco Test', tipoDeuda: 'Prestamo', notas: '' } });
    document.body.removeChild(form);

    window.history.pushState({}, '', '/gastos/deudas');
    const shell = document.createElement('debt-entity-shell');
    document.body.appendChild(shell);
    await shell.loadEntities();

    const container = shell.querySelector('#entity-table-container');
    assert(container !== null, 'DebtEntityShell debe tener #entity-table-container en vista deudas');
    const row = container.querySelector('tbody tr');
    assert(row !== null, 'Debe haber al menos una fila en la tabla');
    assert(row.textContent.includes('Banco Test'), 'La fila debe contener el acreedor');

    document.body.removeChild(shell);
    window.history.pushState({}, '', '/');
    await cleanup();
}

// ===================================================================
// UC-DS4: DebtEntityShell – formato de columna Cuotas pagado/total
// ===================================================================
async function testDebtEntityShellCuotasFormato() {
    console.log('  DebtEntityShell: columna Cuotas muestra formato pagado/total');
    await cleanup();

    const form = document.createElement('debt-form');
    document.body.appendChild(form);
    form.cuotas = [
        { cuota: 5000, moneda: 'ARS', vencimiento: '2026-03-01', pagado: true },
        { cuota: 5000, moneda: 'ARS', vencimiento: '2026-04-01', pagado: true },
        { cuota: 5000, moneda: 'ARS', vencimiento: '2026-05-01', pagado: false }
    ];
    await form.handleSubmit({ preventDefault: () => {}, detail: { acreedor: 'Test Cuotas', tipoDeuda: 'Prestamo', notas: '' } });
    document.body.removeChild(form);

    window.history.pushState({}, '', '/gastos/deudas');
    const shell = document.createElement('debt-entity-shell');
    document.body.appendChild(shell);
    await shell.loadEntities();

    const container = shell.querySelector('#entity-table-container');
    const row = container.querySelector('tbody tr');
    assert(row !== null, 'Debe haber una fila en la tabla');
    // The cuotas cell is the 3rd <td> (index 2)
    const cuotasCell = row.querySelectorAll('td')[2];
    assert(cuotasCell !== null, 'Debe existir la celda de Cuotas');
    assert(cuotasCell.textContent.trim() === '2/3', `Cuotas debe mostrar "2/3" (2 pagadas, 3 total), obtuvo "${cuotasCell.textContent.trim()}"`);

    document.body.removeChild(shell);
    window.history.pushState({}, '', '/');
    await cleanup();
}

// ===================================================================
// UC-DS3: DebtEntityShell – recarga al evento deuda:saved (vista deudas)
// ===================================================================
async function testDebtEntityShellRecargaAlGuardar() {
    console.log('  DebtEntityShell: recarga la tabla al recibir deuda:saved');
    await cleanup();

    window.history.pushState({}, '', '/gastos/deudas');
    const shell = document.createElement('debt-entity-shell');
    document.body.appendChild(shell);
    // Llamar loadEntities directamente para asegurar que el estado inicial es correcto
    await shell.loadEntities();

    // Inicialmente vacío
    let container = shell.querySelector('#entity-table-container');
    assert(container.textContent.includes('No hay deudas registradas'), 'Debe empezar vacío');

    // Agregar una deuda y disparar el evento deuda:saved
    const form = document.createElement('debt-form');
    document.body.appendChild(form);
    form.cuotas = [{ cuota: 5000, moneda: 'ARS', vencimiento: '2026-04-01', pagado: false }];
    await form.handleSubmit({ preventDefault: () => {}, detail: { acreedor: 'Acreedor Nuevo', tipoDeuda: 'Tarjeta', notas: '' } });
    document.body.removeChild(form);

    // Esperar a que loadEntities() complete tras el evento deuda:saved
    await new Promise(resolve => setTimeout(resolve, 10));

    container = shell.querySelector('#entity-table-container');
    const row = container.querySelector('tbody tr');
    assert(row !== null, 'Debe recargar y mostrar la deuda nueva');
    assert(row.textContent.includes('Acreedor Nuevo'), 'La tabla debe contener el acreedor nuevo');

    document.body.removeChild(shell);
    window.history.pushState({}, '', '/');
    await cleanup();
}

// ===================================================================
// UC-DS5: DebtEntityShell – renderiza tabs de navegación con links reales
// ===================================================================
async function testDebtEntityShellNavTabsRender() {
    console.log('  DebtEntityShell: renderiza tabs de navegación con links reales');
    await cleanup();

    const shell = document.createElement('debt-entity-shell');
    document.body.appendChild(shell);

    const tabs = shell.querySelector('.nav-underline');
    assert(tabs !== null, 'Debe existir .nav-underline');

    const tabLinks = shell.querySelectorAll('.nav-underline .nav-link');
    assert(tabLinks.length === 2, 'Debe haber exactamente 2 tabs');

    const deudaTab = [...tabLinks].find(a => a.getAttribute('href') === '/gastos/deudas');
    assert(deudaTab !== null, 'Debe existir un tab con href="/gastos/deudas"');

    const cuotasTab = [...tabLinks].find(a => a.getAttribute('href') === '/gastos');
    assert(cuotasTab !== null, 'Debe existir un tab con href="/gastos"');

    document.body.removeChild(shell);
    await cleanup();
}

// ===================================================================
// UC-DS6: DebtEntityShell – la vista cuotas se activa con path /gastos
// ===================================================================
async function testDebtEntityShellCuotasView() {
    console.log('  DebtEntityShell: la vista cuotas (path /gastos) muestra debt-list sin columna Tipo');
    await cleanup();

    window.history.pushState({}, '', '/gastos');
    const shell = document.createElement('debt-entity-shell');
    document.body.appendChild(shell);

    assert(shell.currentView === 'cuotas', 'currentView debe ser "cuotas" para path /gastos');
    assert(shell.querySelector('debt-list') !== null, 'La vista cuotas debe incluir <debt-list>');
    assert(shell.querySelector('#entity-table-container') === null, 'En vista cuotas no debe existir #entity-table-container');

    const debtList = shell.querySelector('debt-list');
    assert(debtList !== null, 'debt-list debe existir');
    assert(debtList.getAttribute('exclude-columns') === 'tipoDeuda', 'debt-list debe tener exclude-columns="tipoDeuda"');

    document.body.removeChild(shell);
    window.history.pushState({}, '', '/');
    await cleanup();
}

// ===================================================================
// UC-DL1: DebtList._renderTotals — barra con pendiente y pagado por moneda
// ===================================================================
async function testDebtListRenderTotalsPendienteYPagado() {
    console.log('  DebtList._renderTotals: muestra 1 card pendiente y 1 card pagado agrupando monedas');

    const list = document.createElement('debt-list');
    document.body.appendChild(list);
    list.render();

    list.totalesPendientes = { ARS: 15000, USD: 100 };
    list.totalesPagados = { ARS: 5000 };
    list._renderTotals();

    const totalsEl = list.querySelector('debt-list-totals');
    assert(totalsEl !== null, 'Debe existir debt-list-totals');

    // New: one card per state (not per currency)
    const pendienteItems = totalsEl.querySelectorAll('.bg-warning-subtle');
    assert(pendienteItems.length === 1, 'Debe mostrar 1 card de pendiente (todas las monedas agrupadas)');

    const pagadoItems = totalsEl.querySelectorAll('.bg-success-subtle');
    assert(pagadoItems.length === 1, 'Debe mostrar 1 card de pagado');

    // Amount text must contain both currencies joined with /
    const amountEl = totalsEl.querySelector('.bg-warning-subtle .fw-bold');
    assert(amountEl !== null, 'Debe existir el elemento de cuota pendiente');
    const secondaryEl = amountEl.querySelector('small');
    assert(secondaryEl !== null, 'Cuota pendiente con multi-moneda debe tener elemento small para moneda secundaria');

    const pendienteLabel = totalsEl.querySelector('.text-warning-emphasis');
    assert(pendienteLabel !== null && pendienteLabel.textContent.includes('Pendiente'), 'Debe mostrar etiqueta Pendiente');

    document.body.removeChild(list);
}

// ===================================================================
// UC-DL2: DebtList._renderTotals — no renderiza barra cuando todos los totales son 0
// ===================================================================
async function testDebtListRenderTotalsVacioSiTodosCero() {
    console.log('  DebtList._renderTotals: no renderiza barra cuando todos los totales son 0');

    const list = document.createElement('debt-list');
    document.body.appendChild(list);
    list.render();

    // First confirm it renders when there is a non-zero value
    list.totalesPendientes = { ARS: 500 };
    list.totalesPagados = {};
    list._renderTotals();

    const totalsEl = list.querySelector('debt-list-totals');
    assert(totalsEl.innerHTML.trim() !== '', 'Debe tener contenido cuando hay totales no-cero');

    // All zero: bar must be cleared
    list.totalesPendientes = { ARS: 0 };
    list.totalesPagados = { ARS: 0 };
    list._renderTotals();

    assert(totalsEl.innerHTML.trim() === '', 'No debe renderizar barra cuando todos los totales son 0');

    document.body.removeChild(list);
}

// ===================================================================
// UC-DL3: DebtList._renderTotals — actualiza la barra al cambiar totales
// ===================================================================
async function testDebtListRenderTotalsActualizaTrasRefresh() {
    console.log('  DebtList._renderTotals: actualiza la barra al setear nuevos totales');

    const list = document.createElement('debt-list');
    document.body.appendChild(list);
    list.render();

    // Initial render: only pendiente USD
    list.totalesPendientes = { USD: 200 };
    list.totalesPagados = {};
    list._renderTotals();

    const totalsEl = list.querySelector('debt-list-totals');
    assert(totalsEl.querySelectorAll('.bg-warning-subtle').length === 1, 'Inicial: 1 card pendiente');
    assert(totalsEl.querySelectorAll('.bg-success-subtle').length === 0, 'Inicial: sin cards pagado');

    // Update: two currencies pending, one pagado — still 1 card per state
    list.totalesPendientes = { USD: 200, ARS: 8000 };
    list.totalesPagados = { ARS: 3000 };
    list._renderTotals();

    assert(totalsEl.querySelectorAll('.bg-warning-subtle').length === 1, 'Tras update: 1 card pendiente (multi-moneda agrupada)');
    assert(totalsEl.querySelectorAll('.bg-success-subtle').length === 1, 'Tras update: 1 card pagado');

    document.body.removeChild(list);
}

// ===================================================================
// UC-DL4: DebtList._renderTotals — barra vacía cuando currencies están ausentes
// ===================================================================
async function testDebtListRenderTotalsNoCurrencies() {
    console.log('  DebtList._renderTotals: no renderiza barra sin monedas');

    const list = document.createElement('debt-list');
    document.body.appendChild(list);
    list.render();

    list.totalesPendientes = {};
    list.totalesPagados = {};
    list._renderTotals();

    const totalsEl = list.querySelector('debt-list-totals');
    assert(totalsEl.innerHTML.trim() === '', 'No debe renderizar barra cuando no hay monedas');

    document.body.removeChild(list);
}

// ===================================================================
// UC-DL5: DebtList._renderTotals — ignora vencimientos vacíos o inválidos
// ===================================================================
async function testDebtListRenderTotalsIgnoraVencimientosInvalidos() {
    console.log('  DebtList._renderTotals: ignora vencimientos vacíos o inválidos');

    const list = document.createElement('debt-list');
    document.body.appendChild(list);
    list.render();

    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    list.totalesPendientes = { ARS: 1500 };
    list.totalesPagados = {};
    list.debts = [{
        cuotas: [
            { pagado: false, vencimiento: yesterday },
            { pagado: false, vencimiento: '' },
            { pagado: false, vencimiento: 'sin-fecha' },
            { pagado: true, vencimiento: yesterday }
        ]
    }];
    list._renderTotals();

    const totalsEl = list.querySelector('debt-list-totals');
    assert(totalsEl.textContent.includes('1 cuota vencida'), 'Debe contar solo el vencimiento válido no pagado');
    assert(!totalsEl.textContent.includes('2 cuotas vencidas'), 'No debe contar vencimientos vacíos o inválidos');

    const summary = summarizeDebtListTotals(list.debts, '2999-01-01');
    assert(summary.vencidas === 1, 'DebtListTotals debe calcular vencidas ignorando fechas inválidas');
    assert(summary.pagadosCount === 1, 'DebtListTotals debe calcular cantidad de pagos realizados');

    document.body.removeChild(list);
}

// ===================================================================
// UC-DL6: DebtList agrupada — mantiene DebtRowItem y no vuelve a AppTable
// ===================================================================
async function testDebtListGroupedUsesDebtRowItemLayout() {
    console.log('  DebtList agrupada: usa DebtRowItem y no reintroduce AppTable');

    const list = document.createElement('debt-list');
    document.body.appendChild(list);
    list.render();

    list.groupBy = 'acreedor';
    list._showDetailAction = true;
    list._excludeColumns = ['tipoDeuda'];
    list.debts = [{
        acreedor: 'Banco Galicia',
        tipoDeuda: 'Prestamo',
        cuotas: [
            { id: 1, deudaId: 10, cuota: 1000, moneda: 'ARS', vencimiento: '2026-12-01', pagado: false },
            { id: 2, deudaId: 10, cuota: 500, moneda: 'ARS', vencimiento: '2026-12-10', pagado: false },
        ]
    }];

    list.renderTable();

    assert(list.querySelector('app-table') === null, 'La vista agrupada no debe renderizar AppTable');
    assert(list.querySelectorAll('tbody tr').length === 1, 'La vista agrupada debe renderizar filas compactas');
    assert(list.querySelector('.debt-card-avatar') !== null, 'La vista agrupada debe usar la estructura de DebtRowItem');
    assert(list.querySelector('app-checkbox') === null, 'La fila agrupada no debe mostrar switch de pago individual');
    assert(list.querySelector('i.bi-chevron-right') !== null, 'La fila agrupada debe mostrar acción de detalle individual cuando show-detail-action está habilitado');
    assert(list.querySelector('.fw-normal.text-nowrap')?.textContent === '$ 1.500,00', 'La fila agrupada debe mostrar la cuota agregada');

    document.body.removeChild(list);
}

// ===================================================================
// UC-DS7: DebtEntityShell._renderTotalesBar — agrega pendiente por moneda
// ===================================================================
async function testDebtEntityShellTotalesBarPorMoneda() {
    console.log('  DebtEntityShell._renderTotalesBar: muestra pendiente total agregado por moneda');
    await cleanup();

    const form = document.createElement('debt-form');
    document.body.appendChild(form);
    form.cuotas = [
        { cuota: 10000, moneda: 'ARS', vencimiento: '2026-06-01', pagado: false },
        { cuota: 5000,  moneda: 'ARS', vencimiento: '2026-07-01', pagado: false },
        { cuota: 50,    moneda: 'USD', vencimiento: '2026-06-01', pagado: false }
    ];
    await form.handleSubmit({ preventDefault: () => {}, detail: { acreedor: 'Banco Multi', tipoDeuda: 'Prestamo', notas: '' } });
    document.body.removeChild(form);

    window.history.pushState({}, '', '/gastos/deudas');
    const shell = document.createElement('debt-entity-shell');
    document.body.appendChild(shell);
    await shell.loadEntities();

    const container = shell.querySelector('#entity-table-container');
    const badges = container.querySelectorAll('.badge.text-bg-warning');
    assert(badges.length === 2, 'Debe mostrar 2 badges de pendiente (ARS y USD)');

    const totalsBar = container.querySelector('.border-top');
    assert(totalsBar !== null, 'Debe existir la barra de totales con borde superior');
    assert(totalsBar.textContent.includes('Pendiente total'), 'Barra debe mostrar etiqueta "Pendiente total"');

    document.body.removeChild(shell);
    window.history.pushState({}, '', '/');
    await cleanup();
}

// ===================================================================
// UC-DS8: DebtEntityShell._renderTotalesBar — sin barra cuando todo está pagado
// ===================================================================
async function testDebtEntityShellTotalesBarSinPendiente() {
    console.log('  DebtEntityShell._renderTotalesBar: no muestra barra cuando no hay pendiente');
    await cleanup();

    const form = document.createElement('debt-form');
    document.body.appendChild(form);
    form.cuotas = [
        { cuota: 10000, moneda: 'ARS', vencimiento: '2026-06-01', pagado: true }
    ];
    await form.handleSubmit({ preventDefault: () => {}, detail: { acreedor: 'Banco Pagado', tipoDeuda: 'Prestamo', notas: '' } });
    document.body.removeChild(form);

    window.history.pushState({}, '', '/gastos/deudas');
    const shell = document.createElement('debt-entity-shell');
    document.body.appendChild(shell);
    await shell.loadEntities();

    const container = shell.querySelector('#entity-table-container');
    const totalsBar = container.querySelector('.border-top');
    assert(totalsBar === null, 'No debe mostrar barra de totales cuando todos las cuotas están pagados');

    document.body.removeChild(shell);
    window.history.pushState({}, '', '/');
    await cleanup();
}

// ===================================================================
// UC-DS9: DebtEntityShell._renderTotalesBar — varias entidades se agregan
// ===================================================================
async function testDebtEntityShellTotalesBarAgregaVariasEntidades() {
    console.log('  DebtEntityShell._renderTotalesBar: agrega pendiente de varias entidades por moneda');
    await cleanup();

    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    form.cuotas = [{ cuota: 20000, moneda: 'ARS', vencimiento: '2026-06-01', pagado: false }];
    await form.handleSubmit({ preventDefault: () => {}, detail: { acreedor: 'Entidad A', tipoDeuda: 'Prestamo', notas: '' } });
    form.reset();

    form.cuotas = [{ cuota: 8000, moneda: 'ARS', vencimiento: '2026-07-01', pagado: false }];
    await form.handleSubmit({ preventDefault: () => {}, detail: { acreedor: 'Entidad B', tipoDeuda: 'Tarjeta', notas: '' } });
    document.body.removeChild(form);

    window.history.pushState({}, '', '/gastos/deudas');
    const shell = document.createElement('debt-entity-shell');
    document.body.appendChild(shell);
    await shell.loadEntities();

    const container = shell.querySelector('#entity-table-container');
    // One ARS badge aggregating both entities (20000 + 8000 = 28000)
    const badges = container.querySelectorAll('.badge.text-bg-warning');
    assert(badges.length === 1, 'Debe mostrar 1 badge ARS aggregando ambas entidades');

    document.body.removeChild(shell);
    window.history.pushState({}, '', '/');
    await cleanup();
}

// ===================================================================
// UC-ML1: DebtRowItem (clase JS) — renderiza <tr> + <td> responsivos Bootstrap
// ===================================================================
async function testDebtRowItem() {
    console.log('  UC-ML1: DebtRowItem renderiza tr+td con helpers Bootstrap');

    // Helpers de módulo (getInitials, getAvatarClasses, getTipoIcon, getEstado)
    assert(getInitials('Juan Perez') === 'JP', 'getInitials: 2 palabras → primeras letras');
    assert(getInitials('Banco') === 'BA', 'getInitials: 1 palabra → 2 chars');
    assert(getInitials('') === '', 'getInitials: cadena vacía → vacío');

    const avClasses = getAvatarClasses('Banco');
    assert(typeof avClasses === 'string', 'getAvatarClasses debe retornar string');
    assert(avClasses.includes('bg-'), 'getAvatarClasses debe incluir clase de fondo Bootstrap');
    assert(getAvatarClasses('Banco') === avClasses, 'getAvatarClasses debe ser determinístico');

    assert(getTipoIcon('Alquiler') === 'bi-house', 'Alquiler → bi-house');
    assert(getTipoIcon('Prestamo') === 'bi-bank2', 'Prestamo → bi-bank2');
    assert(getTipoIcon('Préstamo') === 'bi-bank2', 'Préstamo (con acento) → bi-bank2');
    assert(getTipoIcon('Tarjeta de crédito') === 'bi-credit-card', 'Tarjeta → bi-credit-card');
    assert(getTipoIcon('Servicio') === 'bi-tools', 'Servicio → bi-tools');
    assert(getTipoIcon('Otro') === 'bi-tag', 'Tipo desconocido → bi-tag');

    const estadoPagado = getEstado({ pagado: true, vencimiento: '2026-01-01' });
    assert(estadoPagado !== null && estadoPagado.label === 'Pagado', 'getEstado pagado → Pagado');
    assert(estadoPagado.className === 'text-bg-success', 'getEstado pagado → verde');

    const estadoPendiente = getEstado({ pagado: false, vencimiento: '2999-12-31' });
    assert(estadoPendiente !== null && estadoPendiente.label === 'Pendiente', 'Pendiente sin vencer → Pendiente');
    assert(estadoPendiente.className === 'text-bg-secondary', 'getEstado pendiente → gris secondary');

    // formatDate: convierte YYYY-MM-DD → DD/MM/YYYY
    assert(formatDate('2026-12-01') === '01/12/2026', 'formatDate: fecha estándar');
    assert(formatDate('2024-01-15') === '15/01/2024', 'formatDate: día y mes con cero');
    assert(formatDate('') === '', 'formatDate: cadena vacía → vacía');
    assert(formatDate(null) === '', 'formatDate: null → vacío');
    assert(formatDate(undefined) === '', 'formatDate: undefined → vacío');
    assert(formatDate('no-date') === 'no-date', 'formatDate: formato inválido → sin cambios');
    assert(formatDate('2026-13') === '2026-13', 'formatDate: formato incompleto → sin cambios');

    // DebtRowItem: renderiza <tr> con layout unificado (sin breakpoints separados)
    const row = {
        id: 99,
        acreedor: 'Test Acreedor',
        tipoDeuda: 'Prestamo',
        cuota: 1000,
        moneda: 'ARS',
        vencimiento: '2026-12-01',
        pagado: false,
        _reload: () => {},
        _onRowClick: () => {},
    };

    // Necesitamos un <table><tbody> para que el <tr> pueda insertarse correctamente
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    document.body.appendChild(table);

    const rowItem = new DebtRowItem(row, { excludeColumns: [], showDetailAction: true });
    tbody.appendChild(rowItem.element);

    const tr = rowItem.element;
    assert(tr !== null && tr.tagName === 'TR', 'DebtRowItem.element debe ser un <tr> directo');

    // Layout unificado: 2 celdas visibles en todos los breakpoints (sin d-md-none)
    const allCells = tr.querySelectorAll('td.d-table-cell');
    assert(allCells.length >= 2, 'Debe haber al menos 2 celdas visibles en todos los breakpoints');

    // Sin celdas exclusivas de desktop (layout unificado)
    const desktopCells = tr.querySelectorAll('td.d-none.d-md-table-cell');
    assert(desktopCells.length === 0, 'No debe haber celdas exclusivas de desktop (layout unificado)');

    // Avatar circular con iniciales
    const avatarEl = tr.querySelector('.debt-card-avatar.rounded-circle');
    assert(avatarEl !== null, 'DebtRowItem debe tener avatar circular con clase .debt-card-avatar');
    assert(avatarEl.textContent === 'TA', 'Avatar debe mostrar iniciales de "Test Acreedor"');
    assert(avatarEl.className.includes('bg-') && avatarEl.className.includes('text-'), 'Avatar usa clases de color Bootstrap');

    // Nombre del acreedor en mobile
    const nameEl = tr.querySelector('.fw-bold.text-break');
    assert(nameEl !== null && nameEl.textContent === 'Test Acreedor', 'Debe mostrar nombre del acreedor');

    const amountEl = tr.querySelector('.fw-normal.text-nowrap');
    assert(amountEl !== null, 'Debe mostrar cuota con peso normal');
    assert(amountEl.textContent === '$ 1.000,00', 'Cuota debe mantener dos decimales');

    // Badge de tipo con ícono Bootstrap Icons
    const tipoBadge = tr.querySelector('.badge.rounded-pill');
    assert(tipoBadge !== null, 'Debe renderizar badge de tipo');
    assert(tipoBadge.querySelector('i.bi-bank2') !== null, 'Badge Prestamo debe tener bi-bank2');

    // Fecha con ícono de calendario (formateada DD/MM/YYYY)
    const calIcon = tr.querySelector('i.bi-calendar3');
    assert(calIcon !== null, 'Debe mostrar ícono de calendario');
    const dateText = calIcon.parentElement?.textContent || '';
    assert(dateText.includes('01/12/2026'), 'Fecha debe mostrarse como DD/MM/YYYY');

    // Chevron (affordance de navegación)
    const chevron = tr.querySelector('i.bi-chevron-right');
    assert(chevron !== null, 'Con _onRowClick debe mostrar chevron');

    const rowNoDetail = { ...row, _onRowClick: () => {} };
    const rowItemNoDetail = new DebtRowItem(rowNoDetail, { excludeColumns: [], showDetailAction: false });
    assert(rowItemNoDetail.element.querySelector('i.bi-chevron-right') === null, 'showDetailAction=false debe ocultar chevron');
    assert(!rowItemNoDetail.element.classList.contains('cursor-pointer'), 'showDetailAction=false no debe marcar la fila como clickeable');

    const rowItemNoPayment = new DebtRowItem(row, { excludeColumns: [], showDetailAction: true, showPaymentAction: false });
    assert(rowItemNoPayment.element.querySelector('app-checkbox') === null, 'showPaymentAction=false debe ocultar el switch');

    // _renderEstadoPago y _renderEstadoPagoCard deben quedar registrados en el row
    assert(typeof row._renderEstadoPago === 'function', 'Debe exponer _renderEstadoPago en el row');
    assert(typeof row._renderEstadoPagoCard === 'function', 'Debe exponer _renderEstadoPagoCard en el row');

    document.body.removeChild(table);
}

export const tests = [
    testCrearDeudaDesdeFormulario,
    testEditarDeudaDesdeFormulario,
    testImportarConMerge,
    testEliminarDeudas,
    testDeleteDeudasWaitsForTransactionComplete,
    testMultiplesDeudasMismoMes,
    testDebtDetailModal,
    testAcreedorColumnMobileRender,
    testPagoToggleVisualFeedback,
    testAltaInlineAgregarYGuardar,
    testAltaInlineValidacionErrores,
    testCancelarAltaInline,
    testEdicionInlineGuardar,
    testCancelarEdicionInline,
    testSoloUnInlineAbierto,
    testDuplicarCuotaInline,
    testNoModalSecundarioEnDebtForm,
    testDebtFormHideButtons,
    testDebtFormLayoutMobileFirst,
    testDebtFormCampoReordenadoMuestraEstadoInvalido,
    testDebtFormTipoDeudaEsObligatorio,
    testShowFormErrorNearCuotas,
    testDebtFormRequiereCuotasAlEnviar,
    testDebtModalCancelClosesModal,
    testDebtModalInlineCuotaCancelDoesNotCloseModal,
    testDebtModalFooterUxValidacionConsistente,
    testDebtModalReopenClearsValidationState,
    testDebtEntityShellRenderVacio,
    testDebtEntityShellRenderConEntidades,
    testDebtEntityShellRecargaAlGuardar,
    testDebtEntityShellCuotasFormato,
    testDebtEntityShellNavTabsRender,
    testDebtEntityShellCuotasView,
    testDebtListRenderTotalsPendienteYPagado,
    testDebtListRenderTotalsVacioSiTodosCero,
    testDebtListRenderTotalsActualizaTrasRefresh,
    testDebtListRenderTotalsNoCurrencies,
    testDebtListRenderTotalsIgnoraVencimientosInvalidos,
    testDebtListGroupedUsesDebtRowItemLayout,
    testDebtEntityShellTotalesBarPorMoneda,
    testDebtEntityShellTotalesBarSinPendiente,
    testDebtEntityShellTotalesBarAgregaVariasEntidades,
    testDebtRowItem
];
