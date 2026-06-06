// test/cuotas.test.js
// E2E tests for cuotas feature: UI components (CuotaForm, DuplicateCuotaModal)
// → CuotaModel/CuotaEntity → cuotaRepository → IndexedDB
import { assert } from './setup.js';
import {
    addCuota, getCuota, deleteCuota,
    listCuotas, setPagado, countCuotasByMes
} from '../src/features/cuotas/cuotaRepository.js';
import { CuotaModel } from '../src/features/cuotas/CuotaModel.js';

// Import cuotas UI components (registers custom elements)
import '../src/features/cuotas/components/CuotaForm.js';
import '../src/features/cuotas/components/DuplicateCuotaModal.js';

// We also need DebtForm because cuotas are typically created through deudas
import { deleteDeudas } from '../src/features/deudas/deudaRepository.js';
import '../src/features/deudas/components/DebtForm.js';

async function cleanup() {
    try { await deleteDeudas(); } catch (_e) { /* ignore */ }
}

// ===================================================================
// UC1: Agregar cuota desde CuotaForm y verificar en DB
// Flujo: usuario abre CuotaForm, ingresa cuota/moneda/vencimiento,
// hace submit. La cuota se guarda via repository y aparece en la DB.
// ===================================================================
async function testAgregarCuotaDesdeCuotaForm() {
    console.log('  UC1: Agregar cuota desde CuotaForm y verificar en DB');
    await cleanup();

    // Crear CuotaForm y montarlo en el DOM
    const cuotaForm = document.createElement('cuota-form');
    document.body.appendChild(cuotaForm);

    // Verificar que CuotaForm renderiza un app-form
    const appForm = cuotaForm.querySelector('app-form');
    assert(appForm !== null, 'CuotaForm debe contener un app-form');

    // Simular que el usuario llena los campos y hace submit
    // CuotaForm escucha form:submit y re-emite como cuota:save
    let saveEvent = null;
    cuotaForm.addEventListener('cuota:save', (e) => { saveEvent = e; });

    // Disparar form:submit en el app-form interno (como lo haria AppForm)
    appForm.dispatchEvent(new CustomEvent('form:submit', {
        detail: { cuota: 15000, moneda: 'ARS', vencimiento: '2026-03-15' },
        bubbles: true,
        composed: true
    }));

    assert(saveEvent !== null, 'CuotaForm debe emitir cuota:save al recibir form:submit');
    assert(saveEvent.detail.cuota === 15000, 'Detalle del evento: cuota = 15000');
    assert(saveEvent.detail.moneda === 'ARS', 'Detalle del evento: moneda = ARS');
    assert(saveEvent.detail.vencimiento === '2026-03-15', 'Detalle del evento: vencimiento correcto');

    // Ahora simular lo que haria DebtForm: guardar la cuota en la DB via repository
    const model = new CuotaModel({
        deudaId: 1,
        cuota: saveEvent.detail.cuota,
        moneda: saveEvent.detail.moneda,
        vencimiento: saveEvent.detail.vencimiento
    });
    const cuotaId = await addCuota(model);
    assert(cuotaId > 0, 'addCuota debe retornar un ID valido');

    // Verificar que la cuota esta en la DB
    const saved = await getCuota(cuotaId);
    assert(saved !== null, 'Cuota debe existir en la DB');
    assert(saved.cuota === 15000, 'Cuota guardado: 15000');
    assert(saved.moneda === 'ARS', 'Moneda guardada: ARS');
    assert(saved.periodo === '2026-03', 'Periodo calculado: 2026-03');
    assert(saved.pagado === false, 'Pagado por defecto: false');

    document.body.removeChild(cuotaForm);
    await cleanup();
}

// ===================================================================
// UC2: Editar cuota existente y verificar cambios en DB
// Flujo: usuario tiene una cuota, la edita via CuotaForm (precarga datos),
// cambia cuota y moneda, guarda. Verifica que la DB refleja los cambios.
// ===================================================================
async function testEditarCuotaDesdeCuotaForm() {
    console.log('  UC2: Editar cuota desde CuotaForm con precarga');
    await cleanup();

    // Crear cuota inicial en DB
    const model = new CuotaModel({
        deudaId: 1, cuota: 5000, moneda: 'ARS', vencimiento: '2026-04-10'
    });
    const cuotaId = await addCuota(model);

    // Crear CuotaForm y precargar datos dla cuota existente
    const cuotaForm = document.createElement('cuota-form');
    document.body.appendChild(cuotaForm);

    // Simular precarga (como hace DebtForm.openCuotaModal con cuota existente)
    // Setting .cuota re-renders the shadow DOM, so we must get the fresh app-form after
    cuotaForm.cuota = { cuota: 5000, moneda: 'ARS', vencimiento: '2026-04-10' };
    assert(cuotaForm.cuota.cuota === 5000, 'CuotaForm precargado con cuota 5000');

    // Get the fresh app-form after re-render
    const appForm = cuotaForm.querySelector('app-form');

    // Simular edicion: usuario cambia cuota y moneda
    // CuotaForm.render() sets up form:submit -> cuota:submit on the app-form,
    // but connectedCallback's cuota:submit -> cuota:save listener was on the old form.
    // So we listen directly on the app-form for the cuota:submit event to capture the data.
    let submitEvent = null;
    appForm.addEventListener('cuota:submit', (e) => { submitEvent = e; });

    appForm.dispatchEvent(new CustomEvent('form:submit', {
        detail: { cuota: 200, moneda: 'USD', vencimiento: '2026-04-10' },
        bubbles: true,
        composed: true
    }));

    assert(submitEvent !== null, 'CuotaForm app-form emite cuota:submit con datos editados');
    assert(submitEvent.detail.cuota === 200, 'Nuevo cuota: 200');
    assert(submitEvent.detail.moneda === 'USD', 'Nueva moneda: USD');

    // Actualizar en DB via repository (setPagado + deleteCuota + addCuota pattern,
    // since CuotaEntity doesn't carry id through constructor for put)
    // Instead, use the lower-level approach: get existing, delete, add new
    await deleteCuota(cuotaId);
    const updatedModel = new CuotaModel({
        deudaId: 1,
        cuota: submitEvent.detail.cuota,
        moneda: submitEvent.detail.moneda,
        vencimiento: submitEvent.detail.vencimiento
    });
    const newId = await addCuota(updatedModel);

    // Verificar en DB
    const saved = await getCuota(newId);
    assert(saved.cuota === 200, 'DB: cuota actualizado a 200');
    assert(saved.moneda === 'USD', 'DB: moneda actualizada a USD');
    assert(saved.periodo === '2026-04', 'DB: periodo se mantiene 2026-04');

    // La cuota viejo ya no existe
    const old = await getCuota(cuotaId);
    assert(!old, 'Cuota viejo eliminado de la DB');

    document.body.removeChild(cuotaForm);
    await cleanup();
}

// ===================================================================
// UC3: Duplicar cuota desde DuplicateCuotaModal con nueva fecha
// Flujo: usuario tiene una cuota existente, abre DuplicateCuotaModal,
// elige nueva fecha, confirma. La cuota duplicada se guarda en la DB
// con la nueva fecha y periodo.
// ===================================================================
async function testDuplicarCuotaDesdeModal() {
    console.log('  UC3: Duplicar cuota desde DuplicateCuotaModal');
    await cleanup();

    // Crear cuota original
    const original = new CuotaModel({
        deudaId: 1, cuota: 30000, moneda: 'ARS', vencimiento: '2026-05-01'
    });
    const originalId = await addCuota(original);

    // Crear DuplicateCuotaModal y precargar cuota original
    const dupModal = document.createElement('duplicate-cuota-modal');
    document.body.appendChild(dupModal);

    // Precargar datos dla cuota original (como hace DebtForm.openDuplicateCuotaModal)
    // Setting .cuota re-renders the shadow DOM, so get the fresh app-form after
    dupModal.cuota = { cuota: 30000, moneda: 'ARS', vencimiento: '2026-05-01' };
    assert(dupModal.cuota.vencimiento === '2026-05-01', 'Modal precargado con fecha original');

    // Get fresh app-form after re-render and listen for duplicate:submit
    const appForm = dupModal.querySelector('app-form');
    let submitEvent = null;
    appForm.addEventListener('duplicate:submit', (e) => { submitEvent = e; });

    appForm.dispatchEvent(new CustomEvent('form:submit', {
        detail: { vencimiento: '2026-06-01' },
        bubbles: true,
        composed: true
    }));

    assert(submitEvent !== null, 'DuplicateCuotaModal app-form emite duplicate:submit');
    assert(submitEvent.detail.vencimiento === '2026-06-01', 'Nueva fecha: 2026-06-01');

    // Simular lo que hace DebtForm: crear copia con nueva fecha
    const nuevoPeriodo = submitEvent.detail.vencimiento.slice(0, 7);
    const duplicado = new CuotaModel({
        deudaId: 1,
        cuota: 30000,
        moneda: 'ARS',
        vencimiento: submitEvent.detail.vencimiento,
        periodo: nuevoPeriodo
    });
    const dupId = await addCuota(duplicado);

    // Verificar que hay 2 cuotas en DB
    const todos = await listCuotas();
    assert(todos.length === 2, 'Deben haber 2 cuotas (original + duplicado)');

    // Verificar distribucion por mes
    const cuotasMayo = await listCuotas({ mes: '2026-05' });
    assert(cuotasMayo.length === 1, 'Mayo: 1 cuota (original)');
    assert(cuotasMayo[0].id === originalId, 'Mayo: es la cuota original');

    const cuotasJunio = await listCuotas({ mes: '2026-06' });
    assert(cuotasJunio.length === 1, 'Junio: 1 cuota (duplicado)');
    assert(cuotasJunio[0].id === dupId, 'Junio: es la cuota duplicada');
    assert(cuotasJunio[0].cuota === 30000, 'Duplicado mantiene la cuota: 30000');

    document.body.removeChild(dupModal);
    await cleanup();
}

// ===================================================================
// UC4: Cancelar formularios (CuotaForm y DuplicateCuotaModal)
// Flujo: usuario abre CuotaForm/DuplicateCuotaModal y cancela.
// Verifica que se emiten los eventos de cancelacion correctos.
// ===================================================================
async function testCancelarFormularios() {
    console.log('  UC4: Cancelar CuotaForm y DuplicateCuotaModal');
    await cleanup();

    // Test cancelar CuotaForm
    const cuotaForm = document.createElement('cuota-form');
    document.body.appendChild(cuotaForm);

    let cancelCuota = false;
    cuotaForm.addEventListener('cuota:cancel', () => { cancelCuota = true; });

    const appForm = cuotaForm.querySelector('app-form');
    appForm.dispatchEvent(new CustomEvent('form:cancel', { bubbles: true, composed: true }));
    assert(cancelCuota, 'CuotaForm emite cuota:cancel al cancelar');

    document.body.removeChild(cuotaForm);

    // Test cancelar DuplicateCuotaModal
    // Create without setting .cuota so connectedCallback listeners stay on the initial form
    const dupModal = document.createElement('duplicate-cuota-modal');
    document.body.appendChild(dupModal);

    let cancelDup = false;
    dupModal.addEventListener('duplicate:cancel', () => { cancelDup = true; });

    const dupForm = dupModal.querySelector('app-form');
    dupForm.dispatchEvent(new CustomEvent('form:cancel', { bubbles: true, composed: true }));
    assert(cancelDup, 'DuplicateCuotaModal emite duplicate:cancel al cancelar');

    document.body.removeChild(dupModal);
    await cleanup();
}

async function testCuotasFormsUxValidacionConsistente() {
    console.log('  UC4b: Formularios de cuotas mantienen submit habilitado y validan al enviar');
    await cleanup();

    const cuotaForm = document.createElement('cuota-form');
    document.body.appendChild(cuotaForm);

    const cuotaAppForm = cuotaForm.querySelector('app-form');
    const cuotaFormEl = cuotaAppForm.querySelector('form');
    const cuotaSubmitBtn = cuotaFormEl.querySelector('button[type="submit"]');
    const cuotaInput = cuotaForm.querySelector('input[name="cuota"]');

    assert(cuotaSubmitBtn !== null, 'Debe existir botón submit visible en CuotaForm');
    assert(cuotaSubmitBtn.disabled === false, 'El botón submit de CuotaForm debe iniciar habilitado');
    assert(!cuotaFormEl.classList.contains('was-validated'), 'No debe mostrar errores antes del primer envío en CuotaForm');

    cuotaAppForm.triggerSubmit();

    assert(cuotaFormEl.classList.contains('was-validated'), 'Debe mostrar errores sólo al intentar guardar la cuota');
    assert(cuotaInput.validity.valueMissing === true, 'Cuota debe quedar inválido por required al enviar vacío');

    document.body.removeChild(cuotaForm);

    const dupModal = document.createElement('duplicate-cuota-modal');
    document.body.appendChild(dupModal);

    const dupAppForm = dupModal.querySelector('app-form');
    const dupFormEl = dupAppForm.querySelector('form');
    const dupSubmitBtn = dupFormEl.querySelector('button[type="submit"]');
    const vencimientoInput = dupModal.querySelector('input[name="vencimiento"]');

    assert(dupSubmitBtn !== null, 'Debe existir botón submit visible en DuplicateCuotaModal');
    assert(dupSubmitBtn.disabled === false, 'El botón submit de DuplicateCuotaModal debe iniciar habilitado');
    assert(!dupFormEl.classList.contains('was-validated'), 'No debe mostrar errores antes del primer envío en duplicar cuota');

    dupAppForm.triggerSubmit();

    assert(dupFormEl.classList.contains('was-validated'), 'Debe mostrar errores sólo al intentar duplicar');
    assert(vencimientoInput.validity.valueMissing === true, 'Vencimiento debe quedar inválido por required al enviar vacío');

    document.body.removeChild(dupModal);
    await cleanup();
}

async function testCuotaFormLayoutCamposYAcciones() {
    console.log('  UC4c: CuotaForm separa campos y acciones en dos filas');
    await cleanup();

    const cuotaForm = document.createElement('cuota-form');
    document.body.appendChild(cuotaForm);
    await customElements.whenDefined('cuota-form');
    await Promise.resolve();

    const formEl = cuotaForm.querySelector('app-form form');
    const fieldsRow = formEl.firstElementChild;
    const actionRow = fieldsRow.nextElementSibling;
    const fields = [...fieldsRow.children];
    const fieldNames = fields.map(field => field.dataset.fieldName);

    assert(fieldsRow.classList.contains('row'), 'La primera fila debe contener los campos');
    assert(fieldNames[0] === 'cuota', 'El primer campo debe ser Cuota');
    assert(fieldNames[1] === 'moneda', 'El segundo campo debe ser Moneda');
    assert(fieldNames[2] === 'vencimiento', 'El tercer campo debe ser Vencimiento');
    assert(fields.every(field => field.classList.contains('col-12')), 'Cada campo debe ocupar ancho completo en mobile');
    assert(fields.every(field => field.classList.contains('col-md-4')), 'Los tres campos deben compartir la fila en desktop');
    assert(actionRow.classList.contains('justify-content-end'), 'La fila de acciones debe alinearse a la derecha');
    assert(actionRow.querySelector('#cancelBtn') !== null, 'La fila de acciones debe incluir Cancelar');
    assert(actionRow.querySelector('button[type="submit"]') !== null, 'La fila de acciones debe incluir Guardar');

    document.body.removeChild(cuotaForm);
    await cleanup();
}

async function testCuotaFormInlineLayoutSeparatesValidationAndActions() {
    console.log('  UC4d: CuotaForm inline mantiene validación y acciones debajo de los campos');
    await cleanup();

    const cuotaForm = document.createElement('cuota-form');
    cuotaForm.inline = true;
    cuotaForm.compactErrors = true;
    document.body.appendChild(cuotaForm);
    await customElements.whenDefined('cuota-form');
    await Promise.resolve();

    const formEl = cuotaForm.querySelector('app-form form');
    const fieldsRow = formEl.firstElementChild;
    const generalError = formEl.querySelector('[data-cuota-general-error="true"]');
    const actionRow = formEl.querySelector('[data-form-actions="true"]');
    const cancelBtn = actionRow.querySelector('#cancelBtn');
    const saveBtn = actionRow.querySelector('button[type="submit"]');

    assert(!formEl.classList.contains('flex-md-row'), 'El inline no debe forzar flex-md-row');
    assert(fieldsRow.classList.contains('row'), 'La primera fila inline debe contener los campos');
    assert(generalError !== null, 'El inline debe renderizar el mensaje general compacto');
    assert(generalError.previousElementSibling === fieldsRow, 'El mensaje general debe ir debajo de la fila de campos');
    assert(generalError.nextElementSibling === actionRow, 'La fila de acciones debe ir debajo del mensaje general');
    assert(generalError.classList.contains('w-100'), 'El mensaje general debe ocupar todo el ancho');
    assert(actionRow.classList.contains('justify-content-end'), 'Las acciones inline deben alinearse a la derecha');
    assert(actionRow.classList.contains('mt-3'), 'Las acciones inline deben separarse de los campos con margen superior');
    assert(cancelBtn !== null, 'La fila de acciones inline debe incluir Cancelar');
    assert(saveBtn !== null, 'La fila de acciones inline debe incluir Guardar');
    assert(cancelBtn.classList.contains('btn-outline-secondary'), 'Cancelar inline debe verse como acción secundaria liviana');
    assert(cancelBtn.classList.contains('btn-sm'), 'Cancelar inline debe usar tamaño chico');
    assert(saveBtn.classList.contains('btn-success'), 'Guardar inline debe mantenerse como acción primaria verde');
    assert(saveBtn.classList.contains('btn-sm'), 'Guardar inline debe usar tamaño chico');

    document.body.removeChild(cuotaForm);
    await cleanup();
}

// ===================================================================
// UC5: Flujo completo — crear deuda con cuotas via DebtForm, listar
// por mes, marcar pagado, verificar totales, eliminar cuota individual
// Flujo: usuario crea deuda con 3 cuotas en distintos meses y monedas,
// navega por mes, marca uno como pagado, verifica totales, borra uno.
// ===================================================================
async function testFlujoCompletoCuotasViaDebtForm() {
    console.log('  UC5: Flujo completo — cuotas via DebtForm, filtrar, pagado, totales, borrar');
    await cleanup();

    // Crear deuda con cuotas via DebtForm (como haria el usuario)
    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    form.cuotas = [
        { cuota: 10000, moneda: 'ARS', vencimiento: '2026-07-15', pagado: false },
        { cuota: 20000, moneda: 'ARS', vencimiento: '2026-07-20', pagado: false },
        { cuota: 150, moneda: 'USD', vencimiento: '2026-08-01', pagado: false }
    ];
    await form.handleSubmit({
        preventDefault: () => {},
        detail: { acreedor: 'Test Acreedor', tipoDeuda: 'Prestamo', notas: '' }
    });

    // Listar cuotas de julio
    const cuotasJulio = await listCuotas({ mes: '2026-07' });
    assert(cuotasJulio.length === 2, 'Julio: 2 cuotas ARS');
    assert(cuotasJulio.every(m => m.moneda === 'ARS'), 'Julio: todos en ARS');

    // Listar cuotas de agosto
    const cuotasAgosto = await listCuotas({ mes: '2026-08' });
    assert(cuotasAgosto.length === 1, 'Agosto: 1 cuota USD');
    assert(cuotasAgosto[0].moneda === 'USD', 'Agosto: moneda USD');
    assert(cuotasAgosto[0].cuota === 150, 'Agosto: cuota 150');

    // Totales iniciales julio: todo pendiente
    const totalesJulio = await countCuotasByMes({ mes: '2026-07' });
    assert(totalesJulio.totalesPendientes.ARS === 30000, 'Julio pendiente ARS: 30000');
    assert(!totalesJulio.totalesPagados.ARS, 'Julio pagado ARS: 0');

    // Marcar el primer cuota de julio como pagado
    const primerCuota = cuotasJulio.find(m => m.cuota === 10000);
    await setPagado(primerCuota.id, true);

    // Verificar totales actualizados
    const totalesPost = await countCuotasByMes({ mes: '2026-07' });
    assert(totalesPost.totalesPagados.ARS === 10000, 'Julio pagado ARS post: 10000');
    assert(totalesPost.totalesPendientes.ARS === 20000, 'Julio pendiente ARS post: 20000');

    // Verificar que agosto no se ve afectado
    const totalesAgosto = await countCuotasByMes({ mes: '2026-08' });
    assert(totalesAgosto.totalesPendientes.USD === 150, 'Agosto pendiente USD: 150');
    assert(!totalesAgosto.totalesPagados.USD, 'Agosto pagado USD: 0');

    // Eliminar la cuota de agosto
    await deleteCuota(cuotasAgosto[0].id);
    const cuotasAgostoPost = await listCuotas({ mes: '2026-08' });
    assert(cuotasAgostoPost.length === 0, 'Agosto post-borrar: 0 cuotas');

    // Julio sigue intacto
    const cuotasJulioPost = await listCuotas({ mes: '2026-07' });
    assert(cuotasJulioPost.length === 2, 'Julio sigue con 2 cuotas');

    // Total general
    const todosCuotas = await listCuotas();
    assert(todosCuotas.length === 2, 'Total: 2 cuotas (se borro 1 de 3)');

    document.body.removeChild(form);
    await cleanup();
}

// ===================================================================
// UC6: Cuotas en multiples monedas con totales mixtos
// Flujo: usuario crea cuotas en ARS y USD en el mismo mes.
// Algunos pagados, otros no. Verifica que countCuotasByMes
// separa correctamente por moneda y estado.
// ===================================================================
async function testTotalesMixtosPorMoneda() {
    console.log('  UC6: Totales mixtos por moneda y estado de pago');
    await cleanup();

    const form = document.createElement('debt-form');
    document.body.appendChild(form);

    // Deuda 1: cuotas en ARS
    form.cuotas = [
        { cuota: 5000, moneda: 'ARS', vencimiento: '2026-09-01', pagado: true },
        { cuota: 8000, moneda: 'ARS', vencimiento: '2026-09-15', pagado: false }
    ];
    await form.handleSubmit({
        preventDefault: () => {},
        detail: { acreedor: 'Edesur', tipoDeuda: 'Servicio', notas: '' }
    });
    form.reset();

    // Deuda 2: cuotas en USD y ARS
    form.cuotas = [
        { cuota: 100, moneda: 'USD', vencimiento: '2026-09-10', pagado: false },
        { cuota: 3000, moneda: 'ARS', vencimiento: '2026-09-20', pagado: true }
    ];
    await form.handleSubmit({
        preventDefault: () => {},
        detail: { acreedor: 'Netflix', tipoDeuda: 'Suscripcion', notas: '' }
    });

    // Verificar totales de septiembre
    const totales = await countCuotasByMes({ mes: '2026-09' });

    // ARS: 5000 pagado + 3000 pagado = 8000 pagado; 8000 pendiente
    assert(totales.totalesPagados.ARS === 8000, 'Septiembre pagado ARS: 8000');
    assert(totales.totalesPendientes.ARS === 8000, 'Septiembre pendiente ARS: 8000');

    // USD: 100 pendiente
    assert(totales.totalesPendientes.USD === 100, 'Septiembre pendiente USD: 100');
    assert(!totales.totalesPagados.USD, 'Septiembre pagado USD: 0');

    // Listar todos las cuotas del mes
    const cuotasSept = await listCuotas({ mes: '2026-09' });
    assert(cuotasSept.length === 4, 'Septiembre: 4 cuotas totales');

    // Mes sin cuotas
    const cuotasOct = await listCuotas({ mes: '2026-10' });
    assert(cuotasOct.length === 0, 'Octubre: 0 cuotas');

    document.body.removeChild(form);
    await cleanup();
}

export const tests = [
    testAgregarCuotaDesdeCuotaForm,
    testEditarCuotaDesdeCuotaForm,
    testDuplicarCuotaDesdeModal,
    testCancelarFormularios,
    testCuotasFormsUxValidacionConsistente,
    testCuotaFormLayoutCamposYAcciones,
    testCuotaFormInlineLayoutSeparatesValidationAndActions,
    testFlujoCompletoCuotasViaDebtForm,
    testTotalesMixtosPorMoneda
];
