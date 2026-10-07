// test/resumen.test.js
// Vista única (<resumen-mes>): deuda total, secciones Este mes / Acreedores, filtros con estado
// en la URL, botón "+" con bottom sheet y lista combinada.
import { assert, waitFor } from './setup.js';
import Home from '../src/pages/Home.js';
import { readVistaState, vistaUrl, seccionDe, KPI_LINKS, VISTAS, SECCIONES } from '../src/pages/ResumenMes.js';
import { formatDeudaTotal, sumDeudaPendiente } from '../src/features/deudas/components/DeudaTotal.js';
import { setSelectedMonth, getSelectedMonth } from '../src/shared/MonthFilter.js';
import { addIngreso } from '../src/features/ingresos/ingresoRepository.js';
import { IngresoModel } from '../src/features/ingresos/IngresoModel.js';
import { getDB } from '../src/shared/database/initDB.js';
import { INGRESOS_STORE, DEUDAS_STORE, MONTOS_STORE } from '../src/shared/database/schema.js';
import '../src/features/deudas/components/DebtForm.js';
import { DebtRowItem } from '../src/features/deudas/components/DebtRowItem.js';
import { listMontos } from '../src/features/montos/montoRepository.js';

const tick = (ms = 30) => new Promise(r => setTimeout(r, ms));

async function clearStores() {
    const db = getDB();
    await Promise.all([INGRESOS_STORE, DEUDAS_STORE, MONTOS_STORE].map(store => new Promise((resolve, reject) => {
        const tx = db.transaction([store], 'readwrite');
        tx.objectStore(store).clear();
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    })));
}

async function crearEgreso(acreedor, montos) {
    const form = document.createElement('debt-form');
    document.body.appendChild(form);
    form.montos = montos;
    await form.handleSubmit({ preventDefault: () => {}, detail: { acreedor, tipoDeuda: 'Tarjeta', notas: '' } });
    form.remove();
}

async function mountHome(url = '/') {
    window.history.pushState({}, '', url);
    const view = Home();
    document.body.appendChild(view);
    await tick();
    return view;
}

function unmount(view) {
    view.remove();
    window.history.pushState({}, '', '/');
}

const panelRows = (view) => view.querySelectorAll('#vista-panel tbody tr');
const tabTexts = (view, label) => [...view.querySelectorAll(`[role="tablist"][aria-label="${label}"] [role="tab"]`)].map(t => t.textContent);

export const tests = [
    async function debtRowItem_togglePagadoNotificaMontoUpdated() {
        console.log('  Resumen: marcar un monto como pagado emite monto:updated (refresca KPIs en la misma vista)');
        await clearStores();
        await crearEgreso('Toggle Test', [{ monto: 300, moneda: 'ARS', vencimiento: '2026-04-05', pagado: false }]);
        const [monto] = await listMontos({ mes: '2026-04' });

        const events = [];
        const onUpdated = (e) => events.push(e.detail);
        window.addEventListener('monto:updated', onUpdated);
        const item = new DebtRowItem({ ...monto, acreedor: 'Toggle Test' }, { showPaymentAction: true });
        document.body.appendChild(item.element);
        item.element.querySelector('app-checkbox').dispatchEvent(new CustomEvent('checkbox-change', { detail: { checked: true } }));
        await waitFor(() => events.length > 0);
        window.removeEventListener('monto:updated', onUpdated);
        item.element.remove();

        assert(events.length === 1 && events[0].id === monto.id && events[0].pagado === true, 'debe emitir monto:updated con id y estado');
        const [actualizado] = await listMontos({ mes: '2026-04' });
        assert(actualizado.pagado === true, 'el monto queda pagado en la base');
        await clearStores();
    },

    function readVistaState_parsesAndDefaults() {
        console.log('  Resumen: readVistaState lee ?vista y ?estado con valores por defecto seguros');
        assert(readVistaState('').vista === 'todo', 'sin query la pestaña es "todo"');
        assert(readVistaState('?vista=ingresos').vista === 'ingresos', 'lee ?vista=ingresos');
        assert(readVistaState('?vista=acreedores').vista === 'acreedores', 'lee ?vista=acreedores');
        assert(readVistaState('?vista=xss<script>').vista === 'todo', 'un valor desconocido vuelve a "todo"');
        const pendientes = readVistaState('?vista=egresos&estado=pendiente');
        assert(pendientes.vista === 'egresos' && pendientes.estado === 'pendiente', 'lee el filtro de pendientes');
        assert(readVistaState('?vista=ingresos&estado=pendiente').estado === '', 'el filtro solo aplica a egresos');
        assert(vistaUrl('todo') === '/' && vistaUrl('acreedores') === '/?vista=acreedores', 'vistaUrl arma la URL de cada pestaña');
        assert(vistaUrl('egresos', 'pendiente') === KPI_LINKS.pendientes, '"Por pagar este mes" abre egresos filtrados');
        assert(seccionDe('acreedores') === 'acreedores' && seccionDe('ingresos') === 'mes', 'cada vista pertenece a una sección');
    },

    function deudaTotal_formatoYSuma() {
        console.log('  Deuda total: suma lo impago de todos los meses por moneda y lo muestra "$ … ARS / US$ …"');
        assert(formatDeudaTotal({ ARS: 39953743.6, USD: 4124 }) === '$ 39.953.743,60 ARS / US$ 4.124,00', 'formato consolidado ARS / USD');
        assert(formatDeudaTotal({ USD: 10, ARS: 5 }) === '$ 5,00 ARS / US$ 10,00', 'ARS siempre primero');
        assert(formatDeudaTotal({}) === '$ 0,00 ARS', 'sin deuda muestra $ 0,00 ARS');
        const totals = sumDeudaPendiente([
            { montos: [{ monto: 100, moneda: 'ARS', pagado: false }, { monto: 50, moneda: 'ARS', pagado: true }] },
            { montos: [{ monto: 20, moneda: 'USD', pagado: false }, { monto: 30, moneda: 'ARS', pagado: false }] },
        ]);
        assert(totals.ARS === 130 && totals.USD === 20, 'suma solo los montos impagos, de todas las deudas');
    },

    async function resumen_rendersUnifiedView() {
        console.log('  Resumen: deuda total, secciones, resumen compacto, filtros y un solo botón "+"');
        await clearStores();
        await crearEgreso('Banco Uno', [
            { monto: 1000, moneda: 'ARS', vencimiento: '2026-01-10', pagado: false },
            { monto: 50, moneda: 'USD', vencimiento: '2027-05-10', pagado: false },
        ]);
        const view = await mountHome('/');
        assert(view.tagName === 'RESUMEN-MES', 'Home debe renderizar <resumen-mes>');

        const total = view.querySelector('deuda-total');
        assert(total?.classList.contains('sticky-top'), 'la deuda total queda fija arriba');
        await waitFor(() => total.textContent.includes('ARS /'));
        assert(total.textContent.includes('$ 1.000,00 ARS / US$ 50,00'), 'la deuda total suma todos los meses y monedas');

        assert(JSON.stringify(tabTexts(view, 'Secciones')) === JSON.stringify(SECCIONES.map(s => s.label)), 'secciones Este mes y Acreedores');
        assert(JSON.stringify(tabTexts(view, 'Movimientos del mes')) === JSON.stringify(VISTAS.map(v => v.label)), 'filtros Todo, Ingresos y Egresos');
        assert(view.querySelector('#seccion-tab-mes').getAttribute('aria-selected') === 'true', '"Este mes" seleccionada por defecto');
        assert(view.querySelector('#vista-tab-todo').getAttribute('aria-selected') === 'true' && view.querySelector('#vista-tab-todo').tabIndex === 0, '"Todo" seleccionado');
        assert(view.querySelector('[data-tour-step="indicadores"]') !== null, 'muestra el resumen del mes');

        const panel = view.querySelector('[role="tabpanel"]');
        assert(panel.getAttribute('aria-labelledby') === 'vista-tab-todo', 'el panel apunta a la pestaña activa');
        assert(panel.querySelector('debt-list')?.hasAttribute('include-ingresos'), '"Todo" muestra la lista combinada');

        assert(view.querySelector('#add-income') === null && view.querySelector('#add-debt') === null, 'sin los dos botones grandes de alta');
        const fab = view.querySelector('#add-fab');
        assert(fab?.getAttribute('aria-label') === 'Agregar movimiento' && fab.dataset.tourStep === 'nueva-deuda', 'un único botón "+" (también paso del tour)');

        await waitFor(() => view.querySelector('a.stretched-link'));
        const links = [...view.querySelectorAll('a.stretched-link')].map(a => a.getAttribute('href'));
        assert(links.includes('/?vista=ingresos') && links.includes('/?vista=egresos&estado=pendiente'), 'el resumen abre filtros de esta misma vista');

        total.querySelector('.deuda-total-btn').click();
        assert(window.location.search === '?vista=acreedores', 'tocar la deuda total lleva a Acreedores');
        unmount(view);
        await clearStores();
    },

    async function resumen_fabAbreSheetYFormulario() {
        console.log('  Resumen: el botón "+" abre el bottom sheet y cada opción abre su formulario');
        const view = await mountHome('/');
        let ingresoOpened = 0;
        let debtOpened = 0;
        view.querySelector('ingreso-modal').openCreate = () => { ingresoOpened++; };
        view.querySelector('debt-modal').openCreate = () => { debtOpened++; };

        // UiModal mueve el .modal al <body> al abrirse: se consulta por su referencia
        const sheet = view.querySelector('#registro-sheet')._modalEl;
        assert(sheet.querySelector('.modal-dialog')?.classList.contains('modal-sheet'), 'el selector es un bottom sheet');
        view.querySelector('#add-fab').click();
        assert(sheet.classList.contains('show'), 'el botón "+" abre el sheet');
        assert(sheet.querySelector('.modal-title')?.textContent === '¿Qué querés agregar?', 'el sheet pregunta qué agregar');
        const opciones = [...sheet.querySelectorAll('[data-registro]')].map(b => b.dataset.registro);
        assert(JSON.stringify(opciones) === JSON.stringify(['ingreso', 'egreso']), 'ofrece Ingreso y Egreso');

        sheet.querySelector('[data-registro="ingreso"]').click();
        sheet.querySelector('[data-registro="egreso"]').click();
        assert(!sheet.classList.contains('show'), 'elegir una opción cierra el sheet');
        assert(ingresoOpened === 1, '"Ingreso" abre el formulario de ingreso');
        assert(debtOpened === 1, '"Egreso" abre el formulario de egreso');
        assert(window.location.pathname === '/', 'no navega a otra ruta');
        unmount(view);
    },

    async function resumen_seccionesYFiltrosEnLaUrl() {
        console.log('  Resumen: Acreedores oculta resumen, filtros y selector de mes; la URL guarda la pestaña');
        const view = await mountHome('/');
        const scopes = [];
        const onScope = (e) => scopes.push(e.detail.visible);
        window.addEventListener('ui:month-scope', onScope);

        view.querySelector('#seccion-tab-acreedores').click();
        assert(window.location.search === '?vista=acreedores', 'la URL refleja la sección');
        assert(view.querySelector('#vista-panel acreedores-list') !== null, 'el panel muestra Acreedores');
        assert(view.querySelector('#seccion-mes-header').classList.contains('d-none'), 'oculta resumen y filtros del mes');
        assert(scopes.at(-1) === false, 'avisa que el selector de mes no aplica');

        view.querySelector('#seccion-tab-mes').click();
        assert(window.location.pathname === '/' && window.location.search === '', '"Este mes" vuelve al último filtro (Todo)');
        assert(scopes.at(-1) === true, 'el selector de mes vuelve a mostrarse');

        window.history.pushState({}, '', '/?vista=ingresos');
        window.dispatchEvent(new PopStateEvent('popstate'));
        assert(view.querySelector('#vista-panel ingreso-list') !== null, 'popstate con ?vista=ingresos muestra Ingresos');
        assert(view.querySelector('#vista-tab-ingresos').getAttribute('aria-selected') === 'true', 'el filtro Ingresos queda seleccionado');
        assert(view.querySelector('#seccion-tab-mes').getAttribute('aria-selected') === 'true', 'y la sección Este mes');

        view.querySelector('#seccion-tab-acreedores').click();
        view.querySelector('#seccion-tab-mes').click();
        assert(window.location.search === '?vista=ingresos', 'al volver a Este mes recuerda el último filtro');

        window.history.pushState({}, '', '/?vista=egresos&estado=pendiente');
        window.dispatchEvent(new PopStateEvent('popstate'));
        assert(view.querySelector('#vista-panel debt-list')?.getAttribute('estado') === 'pendiente', 'el filtro de pendientes se aplica a la lista');
        view.querySelector('[data-quitar-filtro]').click();
        assert(window.location.search === '?vista=egresos', '"Ver todos" quita el filtro');

        window.removeEventListener('ui:month-scope', onScope);
        unmount(view);
        assert(scopes.at(-1) === true, 'al salir de la vista el selector de mes queda visible');
    },

    async function resumen_tabsKeyboardNavigation() {
        console.log('  Resumen: flechas, Inicio y Fin recorren cada grupo de pestañas');
        const view = await mountHome('/');
        const key = (tablist, k) => tablist.dispatchEvent(new window.KeyboardEvent('keydown', { key: k, bubbles: true }));
        const filtros = view.querySelector('[role="tablist"][aria-label="Movimientos del mes"]');
        view.querySelector('#vista-tab-todo').focus();
        key(filtros, 'ArrowRight');
        assert(view.querySelector('#vista-tab-ingresos').getAttribute('aria-selected') === 'true', 'ArrowRight pasa a Ingresos');
        key(filtros, 'End');
        assert(view.querySelector('#vista-tab-egresos').getAttribute('aria-selected') === 'true', 'End va al último filtro');
        key(filtros, 'ArrowRight');
        assert(view.querySelector('#vista-tab-todo').getAttribute('aria-selected') === 'true', 'ArrowRight en el último vuelve al primero');

        const secciones = view.querySelector('[role="tablist"][aria-label="Secciones"]');
        view.querySelector('#seccion-tab-mes').focus();
        key(secciones, 'ArrowRight');
        assert(view.querySelector('#seccion-tab-acreedores').getAttribute('aria-selected') === 'true', 'ArrowRight pasa a Acreedores');
        unmount(view);
    },

    async function resumen_todoMezclaIngresosYMontos() {
        console.log('  Resumen: "Todo" mezcla ingresos y montos del mes en orden de fecha');
        const previousMonth = getSelectedMonth();
        await clearStores();
        setSelectedMonth('2026-03');
        await addIngreso(new IngresoModel({ fecha: '2026-03-10', descripcion: 'Sueldo marzo', monto: 1000, moneda: 'ARS' }));
        await crearEgreso('Tarjeta Test', [
            { monto: 300, moneda: 'ARS', vencimiento: '2026-03-05', pagado: false },
            { monto: 200, moneda: 'ARS', vencimiento: '2026-03-20', pagado: true },
        ]);

        const view = await mountHome('/');
        await waitFor(() => panelRows(view).length === 3);
        const rows = [...panelRows(view)].map(tr => tr.textContent.replace(/\s+/g, ' '));
        assert(rows.length === 3, `debe haber 3 movimientos (obtuvo ${rows.length})`);
        assert(rows[0].includes('Tarjeta Test') && rows[0].includes('05 mar'), 'primero el monto del 05/03');
        assert(rows[1].includes('Sueldo marzo') && rows[1].includes('+ $ 1.000,00'), 'después el ingreso del 10/03 con signo +');
        assert(rows[2].includes('20 mar'), 'último el monto del 20/03');

        view.querySelector('#vista-tab-egresos').click();
        await waitFor(() => panelRows(view).length === 2);
        const egresos = panelRows(view);
        assert(egresos.length === 2 && ![...egresos].some(tr => tr.textContent.includes('Sueldo marzo')), 'Egresos muestra solo montos');

        window.history.pushState({}, '', '/?vista=egresos&estado=pendiente');
        window.dispatchEvent(new PopStateEvent('popstate'));
        await waitFor(() => panelRows(view).length === 1);
        const pendientes = panelRows(view);
        assert(pendientes.length === 1 && pendientes[0].textContent.includes('05 mar'), 'Pendientes muestra solo el monto impago');

        unmount(view);
        setSelectedMonth(previousMonth);
        await clearStores();
    },
];
