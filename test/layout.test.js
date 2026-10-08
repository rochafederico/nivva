// test/layout.test.js
// Tests de layout: ResumenHeader, rutas (vista única + redirecciones) y montaje de rutas.
import { assert } from './setup.js';
import ResumenHeader, { GLOBAL_SCOPE_SUBTITLE } from '../src/layout/ResumenHeader.js';
import { DEFAULT_TITLE, DEFAULT_SUBTITLE } from '../src/layout/navConfig.js';
import routes, { REDIRECTS, redirectFor } from '../src/routes.js';
import { openSettingsModal } from '../src/layout/dataActions.js';
import { createIconButton } from '../src/shared/components/createIconButton.js';
import { createRouteRenderer } from '../src/shared/routeRenderer.js';
import Home from '../src/pages/Home.js';

export const tests = [

    function routes_singleViewWithRedirects() {
        console.log('  routes: una sola vista (Inicio) y las rutas viejas redirigen a su pestaña');
        assert(routes.length === 1 && routes[0].path === '/', 'Debe existir una sola ruta: "/"');
        assert(routes[0].title === DEFAULT_TITLE && routes[0].subtitle === DEFAULT_SUBTITLE, 'La ruta usa el encabezado de Inicio');
        assert(redirectFor('/ingresos') === '/?vista=ingresos', '/ingresos → pestaña Ingresos');
        assert(redirectFor('/gastos') === '/?vista=egresos', '/gastos → pestaña Egresos');
        assert(redirectFor('/gastos/deudas') === '/?vista=acreedores', '/gastos/deudas → pestaña Acreedores');
        assert(redirectFor('/gastos/') === '/?vista=egresos', 'tolera la barra final');
        assert(redirectFor('/') === null && redirectFor('/otra') === null, 'Inicio y rutas desconocidas no redirigen');
        assert(Object.keys(REDIRECTS).length === 3, 'Solo las 3 rutas anteriores redirigen');
    },

    function navConfig_headerCopy() {
        console.log('  navConfig: encabezado de Inicio según el glosario');
        assert(DEFAULT_TITLE === 'Tu panorama financiero', 'Título de Inicio');
        assert(typeof DEFAULT_SUBTITLE === 'string' && DEFAULT_SUBTITLE.length > 0, 'Subtítulo de Inicio no vacío');
        assert(!/deuda|gasto/i.test(`${DEFAULT_TITLE} ${DEFAULT_SUBTITLE}`), 'Sin "deudas" ni "gastos" en el encabezado');
    },

    function routeRenderer_removesHomeListeners() {
        console.log('  routeRenderer: salir de Inicio saca sus listeners de window');
        const root = document.createElement('div');
        document.body.appendChild(root);
        const mount = createRouteRenderer(root);
        const removed = [];
        const originalRemove = window.removeEventListener;
        window.removeEventListener = function (type, ...rest) {
            removed.push(type);
            return originalRemove.call(this, type, ...rest);
        };
        try {
            mount(Home());
            mount(document.createElement('div'));
        } finally {
            window.removeEventListener = originalRemove;
            root.remove();
        }
        assert(removed.includes('popstate'), 'Debe sacar el listener popstate de la vista');
        assert(removed.includes('deuda:edit'), 'Debe sacar el listener deuda:edit de la vista');
        assert(removed.includes('ui:month'), 'Debe sacar el listener ui:month de la lista');
    },

    function resumenHeader_hidesMonthSelectorOutsideMonthlyScope() {
        console.log('  ResumenHeader: ui:month-scope oculta el selector de mes y aclara el alcance');
        const header = ResumenHeader({ subtitle: 'Subtítulo mensual.' });
        document.body.appendChild(header);
        const selector = header.querySelector('month-selector');
        const subtitle = header.querySelector('#resumen-header-subtitle');

        window.dispatchEvent(new CustomEvent('ui:month-scope', { detail: { visible: false } }));
        assert(selector.classList.contains('d-none'), 'Fuera del mes se oculta el selector');
        assert(subtitle.textContent === GLOBAL_SCOPE_SUBTITLE, 'El subtítulo aclara que no depende del mes');

        window.dispatchEvent(new CustomEvent('ui:month-scope', { detail: { visible: true } }));
        assert(!selector.classList.contains('d-none'), 'Al volver al mes el selector reaparece');
        assert(subtitle.textContent === 'Subtítulo mensual.', 'Y vuelve el subtítulo original');
        header.remove();
    },

    function routeRenderer_cleansUpPreviousPage() {
        console.log('  routeRenderer: al cambiar de ruta llama cleanup() de la página anterior');
        const root = document.createElement('div');
        const mount = createRouteRenderer(root);
        let cleaned = 0;
        const first = document.createElement('div');
        first.cleanup = () => { cleaned++; };
        const second = document.createElement('div');

        mount(first);
        assert(root.firstChild === first, 'Debe montar la primera página');
        mount(second);
        assert(cleaned === 1, 'Debe llamar cleanup() de la página anterior una vez');
        assert(root.childNodes.length === 1 && root.firstChild === second, 'Debe reemplazar el contenido por la nueva página');
        mount(document.createElement('div'));
        assert(cleaned === 1, 'Una página sin cleanup() no debe fallar');
    },


    function createIconButton_usesBootstrapAndAccessibleLabel() {
        console.log('  createIconButton: usa Bootstrap y aria-label');
        const whitespaceSeparatedExtraClasses = `position-relative\nflex-shrink-0\tshadow-sm`;
        const btn = createIconButton({
            id: 'test-icon-btn',
            icon: 'bi-bell',
            label: 'Ver vencimientos próximos',
            title: 'Vencimientos próximos',
            extraClasses: whitespaceSeparatedExtraClasses,
        });

        assert(btn.tagName === 'BUTTON', 'Debe crear un button nativo');
        assert(btn.id === 'test-icon-btn', 'Debe aplicar id');
        assert(btn.type === 'button', 'Debe usar type button');
        assert(btn.classList.contains('btn'), 'Debe usar clase btn');
        assert(btn.classList.contains('btn-primary'), 'Debe usar variant primary por defecto');
        assert(btn.classList.contains('d-inline-flex'), 'Debe mantener layout inline-flex');
        assert(btn.classList.contains('position-relative'), 'Debe aceptar clases extra');
        assert(btn.classList.contains('flex-shrink-0'), 'Debe separar clases extra por cualquier whitespace');
        assert(btn.classList.contains('shadow-sm'), 'Debe separar clases extra con tabs');
        assert(btn.getAttribute('aria-label') === 'Ver vencimientos próximos', 'Debe aplicar aria-label');
        assert(btn.title === 'Vencimientos próximos', 'Debe aplicar title opcional');
        assert(btn.querySelector('i.bi.bi-bell') !== null, 'Debe renderizar el ícono Bootstrap');
    },

    function createIconButton_rejectsNonStringExtraClasses() {
        console.log('  createIconButton: valida extraClasses string');
        let failed = false;
        try {
            createIconButton({
                icon: 'bi-bell',
                label: 'Ver vencimientos próximos',
                extraClasses: ['position-relative'],
            });
        } catch (err) {
            failed = err instanceof Error;
        }

        assert(failed, 'Debe rechazar extraClasses si no es string');
    },

    function createIconButton_requiresIconAndLabel() {
        console.log('  createIconButton: requiere icon y label');
        const cases = [
            { label: 'Ver vencimientos próximos' },
            { icon: 'bi-bell' },
        ];

        for (const options of cases) {
            let failed = false;
            try {
                createIconButton(options);
            } catch (err) {
                failed = err instanceof Error;
            }

            assert(failed, 'Debe rechazar si falta icon o label');
        }
    },

    function createIconButton_rejectsInvalidVariant() {
        console.log('  createIconButton: valida variant permitido');
        let failed = false;
        try {
            createIconButton({
                icon: 'bi-bell',
                label: 'Ver vencimientos próximos',
                variant: 'outline-primary',
            });
        } catch (err) {
            failed = err instanceof Error;
        }

        assert(failed, 'Debe rechazar variant no permitido');
    },







    // ===================================================================
    // UC2: ResumenHeader renders title, subtitle and month selector
    // ===================================================================
    async function resumenHeader_rendersDefaultContent() {
        console.log('  ResumenHeader: renders default title and subtitle');
        const header = ResumenHeader();
        document.body.appendChild(header);

        const titleEl = header.querySelector('#resumen-header-title');
        assert(titleEl !== null, 'ResumenHeader debe tener #resumen-header-title');
        assert(titleEl.textContent === 'Tu panorama financiero', 'Título por defecto debe ser "Tu panorama financiero"');

        const subtitleEl = header.querySelector('#resumen-header-subtitle');
        assert(subtitleEl !== null, 'ResumenHeader debe tener #resumen-header-subtitle');
        assert(subtitleEl.textContent === DEFAULT_SUBTITLE, 'Subtítulo por defecto debe ser el de Inicio');

        const selector = header.querySelector('month-selector');
        assert(selector !== null, 'ResumenHeader debe mostrar el selector de mes');
        assert(header.querySelector('#resumen-header-month') === null, 'ResumenHeader no debe duplicar el mes fuera del input');

        document.body.removeChild(header);
    },

    async function resumenHeader_acceptsCustomTitleAndSubtitle() {
        console.log('  ResumenHeader: accepts custom title and subtitle via options');
        const header = ResumenHeader({ title: 'Gastos del mes', subtitle: 'Mi subtítulo personalizado.' });
        document.body.appendChild(header);

        const titleEl = header.querySelector('#resumen-header-title');
        assert(titleEl.textContent === 'Gastos del mes', 'Debe renderizar el título personalizado');

        const subtitleEl = header.querySelector('#resumen-header-subtitle');
        assert(subtitleEl.textContent === 'Mi subtítulo personalizado.', 'Debe renderizar el subtítulo personalizado');

        document.body.removeChild(header);
    },


    async function resumenHeader_doesNotRenderSeparateMonthText() {
        console.log('  ResumenHeader: does not render separate month text outside selector');
        const header = ResumenHeader();
        document.body.appendChild(header);

        const monthEl = header.querySelector('#resumen-header-month');
        assert(monthEl === null, 'ResumenHeader no debe renderizar texto de mes separado del selector');

        document.body.removeChild(header);
    },

    async function monthSelector_usesAccessibleDateInput() {
        console.log('  MonthSelector: uses Bootstrap input group for icon and month input');
        const selector = document.createElement('month-selector');
        document.body.appendChild(selector);

        const input = selector.querySelector('#ms-input');
        assert(input.type === 'month', 'Selector debe usar un input month visible');
        assert(input.getAttribute('aria-label') === 'Seleccionar mes', 'Input month debe tener aria-label');
        assert(input.classList.contains('form-control'), 'Input month debe usar form-control');

        const group = selector.querySelector('[data-tour-step="navegacion-mes"]');
        assert(group.classList.contains('d-flex'), 'Controles visibles deben usar layout Bootstrap d-flex');
        assert(group.classList.contains('gap-2'), 'Las flechas deben separarse del input group con gap Bootstrap');
        assert(selector.classList.contains('col-12'), 'Selector debe ocupar el ancho disponible en mobile');
        assert(selector.classList.contains('col-md-6'), 'Selector debe usar col-md-6 desde md');
        assert(selector.classList.contains('col-lg-5'), 'Selector debe usar col-lg-5 en desktop');
        assert(group.classList.contains('w-100'), 'Controles internos deben ocupar el ancho fijo del selector');
        const inputGroup = group.querySelector('.input-group');
        assert(inputGroup !== null, 'Icono e input deben renderizarse dentro de un input group Bootstrap');
        assert(!inputGroup.classList.contains('input-group-lg'), 'Input group no debe usar input-group-lg');
        assert(inputGroup.classList.contains('flex-grow-1'), 'Input group debe ocupar el espacio central disponible');
        assert(inputGroup.classList.contains('w-100'), 'Input group debe mantener ancho estable');
        assert(inputGroup.style.minWidth === '0px' || inputGroup.style.minWidth === '0', 'Input group debe permitir shrink sin depender del contenido');
        assert(input.style.minWidth === '0px' || input.style.minWidth === '0', 'Input month no debe imponer ancho por contenido');
        assert(inputGroup.querySelector('.input-group-text .bi-calendar-event') !== null, 'Input group debe incluir icono de calendario');
        assert(inputGroup.querySelector('#ms-input.form-control') !== null, 'Input month debe estar dentro del input group con form-control');
        assert(selector.querySelector('#ms-prev').classList.contains('flex-shrink-0'), 'Botón anterior debe mantener tamaño con utilidad Bootstrap');
        assert(selector.querySelector('#ms-next').classList.contains('flex-shrink-0'), 'Botón siguiente debe mantener tamaño con utilidad Bootstrap');
        assert(selector.querySelector('#ms-prev').classList.contains('btn-primary'), 'Botón anterior debe usar btn-primary');
        assert(selector.querySelector('#ms-next').classList.contains('btn-primary'), 'Botón siguiente debe usar btn-primary');

        input.value = '2026-07';
        input.dispatchEvent(new Event('change'));
        assert(selector.querySelector('#ms-input').value === '2026-07', 'Selector debe conservar el mes seleccionado');

        document.body.removeChild(selector);
    },

    async function resumenHeader_updateChangesTitle() {
        console.log('  ResumenHeader: update() changes title and subtitle dynamically');
        const header = ResumenHeader({ title: 'Panorama financiero', subtitle: 'Sub inicial.' });
        document.body.appendChild(header);

        header.update({ title: 'Ingresos del mes', subtitle: 'Sub actualizado.' });

        const titleEl = header.querySelector('#resumen-header-title');
        assert(titleEl.textContent === 'Ingresos del mes', 'update() debe cambiar el título');

        const subtitleEl = header.querySelector('#resumen-header-subtitle');
        assert(subtitleEl.textContent === 'Sub actualizado.', 'update() debe cambiar el subtítulo');

        document.body.removeChild(header);
    },

    async function resumenHeader_updatePartialTitle() {
        console.log('  ResumenHeader: update() with only title does not change subtitle');
        const header = ResumenHeader({ title: 'Original', subtitle: 'Sub fijo.' });
        document.body.appendChild(header);

        header.update({ title: 'Nuevo título' });

        const titleEl = header.querySelector('#resumen-header-title');
        assert(titleEl.textContent === 'Nuevo título', 'update() debe cambiar el título');

        const subtitleEl = header.querySelector('#resumen-header-subtitle');
        assert(subtitleEl.textContent === 'Sub fijo.', 'update() no debe cambiar el subtítulo si no se pasa');

        document.body.removeChild(header);
    },

    async function resumenHeader_containsMonthSelector() {
        console.log('  ResumenHeader: contains month-selector element');
        const header = ResumenHeader();
        document.body.appendChild(header);

        const selector = header.querySelector('month-selector');
        assert(selector !== null, 'ResumenHeader debe contener <month-selector>');

        document.body.removeChild(header);
    },




    async function resumenHeader_defaultSubtitleMatchesNavConfig() {
        console.log('  ResumenHeader: default subtitle matches navConfig DEFAULT_SUBTITLE');
        const header = ResumenHeader();
        document.body.appendChild(header);

        const subtitleEl = header.querySelector('#resumen-header-subtitle');
        assert(subtitleEl.textContent === DEFAULT_SUBTITLE, 'El subtítulo por defecto debe coincidir con DEFAULT_SUBTITLE');

        document.body.removeChild(header);
    },

    async function resumenHeader_updateOnlySubtitle() {
        console.log('  ResumenHeader: update() with only subtitle does not change title');
        const header = ResumenHeader({ title: 'Título fijo', subtitle: 'Sub original.' });
        document.body.appendChild(header);

        header.update({ subtitle: 'Sub nuevo.' });

        const titleEl = header.querySelector('#resumen-header-title');
        assert(titleEl.textContent === 'Título fijo', 'update() no debe cambiar el título si no se pasa');

        const subtitleEl = header.querySelector('#resumen-header-subtitle');
        assert(subtitleEl.textContent === 'Sub nuevo.', 'update() debe cambiar el subtítulo');

        document.body.removeChild(header);
    },





    async function settings_modal_isDedicatedSpaceWithListGroupAndDangerZone() {
        console.log('  Layout: Ajustes abre Configuración dedicada con cards + list-group y Zona peligrosa');
        const opener = document.createElement('button');
        document.body.appendChild(opener);

        openSettingsModal(opener);
        const modal = document.querySelector('#settings-data-modal');
        const cards = modal?.querySelectorAll('.card') || [];
        const exportBtn = document.getElementById('settings-export');
        const importBtn = document.getElementById('settings-import');
        const dangerTitle = document.getElementById('settings-danger-zone-title');
        const deleteBtn = document.getElementById('settings-delete');
        assert(modal !== null, 'Debe existir el modal dedicado de Configuración');
        assert(cards.length === 2, 'Configuración debe separar acciones en 2 cards');
        assert(exportBtn !== null, 'Debe incluir opción Exportar datos');
        assert(importBtn !== null, 'Debe incluir opción Importar datos');
        assert(exportBtn.closest('.card') !== null, 'Exportar debe estar dentro de card de datos');
        assert(exportBtn.closest('.list-group') !== null, 'Card de datos debe usar list-group');
        assert(dangerTitle !== null, 'Debe incluir sección Zona peligrosa');
        assert(deleteBtn !== null, 'Zona peligrosa debe incluir Eliminar todo');
        assert(deleteBtn.closest('.card') !== null, 'Eliminar todo debe estar en card separada');

        modal.close();
        modal.parentElement?.remove();
        document.body.removeChild(opener);
    },

];
