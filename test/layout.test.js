// test/layout.test.js
// Tests for layout standardization: ResumenHeader dynamic updates,
// PageSectionLayout structure, navConfig route metadata, and Home quick actions.
import { assert } from './setup.js';
import ResumenHeader from '../src/layout/ResumenHeader.js';
import '../src/layout/PageSectionLayout.js';
import '../src/layout/Sidebar.js';
import '../src/layout/BottomNav.js';
import { navItems, DEFAULT_SUBTITLE } from '../src/layout/navConfig.js';
import { openSettingsModal } from '../src/layout/dataActions.js';
import Home from '../src/pages/Home.js';
import { createIconButton } from '../src/shared/components/createIconButton.js';

export const tests = [

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
    // UC1: navConfig provides title and subtitle for each route
    // ===================================================================
    async function navConfig_hasPageMetadata() {
        console.log('  navConfig: all routes have title and subtitle');
        const requiredPaths = ['/', '/gastos', '/ingresos'];
        for (const path of requiredPaths) {
            const item = navItems.find(i => i.path === path);
            assert(item !== undefined, `navConfig debe tener ruta ${path}`);
            assert(typeof item.title === 'string' && item.title.length > 0, `ruta ${path} debe tener title`);
            assert(item.subtitle === DEFAULT_SUBTITLE, `ruta ${path} debe usar DEFAULT_SUBTITLE`);
        }
    },

    async function navConfig_distinctTitles() {
        console.log('  navConfig: each route has a distinct title');
        const titles = navItems.map(i => i.title);
        const unique = new Set(titles);
        assert(unique.size === titles.length, 'cada ruta debe tener un título único');
    },

    async function navConfig_sharedSubtitleConstant() {
        console.log('  navConfig: DEFAULT_SUBTITLE is exported and used by all routes');
        assert(typeof DEFAULT_SUBTITLE === 'string' && DEFAULT_SUBTITLE.length > 0, 'DEFAULT_SUBTITLE debe ser un string no vacío');
        for (const item of navItems) {
            assert(item.subtitle === DEFAULT_SUBTITLE, `ruta ${item.path} debe usar DEFAULT_SUBTITLE`);
        }
    },

    async function navConfig_homeTitle() {
        console.log('  navConfig: Home title is "Tu panorama financiero"');
        const home = navItems.find(i => i.path === '/');
        assert(home.title === 'Tu panorama financiero', 'Home debe tener título "Tu panorama financiero"');
    },

    async function navConfig_gastosTitle() {
        console.log('  navConfig: Gastos title is "Deudas"');
        const gastos = navItems.find(i => i.path === '/gastos');
        assert(gastos.title === 'Deudas', 'Gastos debe tener título "Deudas"');
    },

    async function navConfig_ingresosTitle() {
        console.log('  navConfig: Ingresos title is "Ingresos del mes"');
        const ingresos = navItems.find(i => i.path === '/ingresos');
        assert(ingresos.title === 'Ingresos del mes', 'Ingresos debe tener título "Ingresos del mes"');
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
        assert(subtitleEl.textContent === 'Gestioná tus pagos y vencimientos del período.', 'Subtítulo debe usar la bajada breve');

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
        assert(selector.classList.contains('col-lg-2'), 'Selector debe usar col-lg-2 en desktop');
        assert(group.classList.contains('w-100'), 'Controles internos deben ocupar el ancho fijo del selector');
        const inputGroup = group.querySelector('.input-group.input-group-lg');
        assert(inputGroup !== null, 'Icono e input deben renderizarse dentro de un input group Bootstrap');
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

    // ===================================================================
    // UC3: PageSectionLayout renders card structure with toolbar slots
    // ===================================================================
    async function pageSectionLayout_rendersCardStructure() {
        console.log('  PageSectionLayout: renders card with toolbar and content slots');
        const layout = document.createElement('page-section-layout');
        document.body.appendChild(layout);

        const card = layout.querySelector('.card');
        assert(card !== null, 'PageSectionLayout debe tener .card');

        const cardHeader = layout.querySelector('.card-header');
        assert(cardHeader !== null, 'PageSectionLayout debe tener .card-header');

        const cardBody = layout.querySelector('.card-body');
        assert(cardBody !== null, 'PageSectionLayout debe tener .card-body');

        const toolbarStart = layout.querySelector('.psl-toolbar-start');
        assert(toolbarStart !== null, 'PageSectionLayout debe tener .psl-toolbar-start');

        const toolbarEnd = layout.querySelector('.psl-toolbar-end');
        assert(toolbarEnd !== null, 'PageSectionLayout debe tener .psl-toolbar-end');

        document.body.removeChild(layout);
    },

    async function pageSectionLayout_toolbarEndAcceptsElement() {
        console.log('  PageSectionLayout: toolbarEnd slot accepts an element');
        const layout = document.createElement('page-section-layout');
        document.body.appendChild(layout);

        const btn = document.createElement('button');
        btn.textContent = 'Nueva deuda';
        btn.id = 'test-btn';
        layout.toolbarEnd = btn;

        const found = layout.querySelector('#test-btn');
        assert(found !== null, 'El botón debe estar en el slot toolbarEnd');
        assert(found.textContent === 'Nueva deuda', 'El botón debe tener el texto correcto');

        document.body.removeChild(layout);
    },

    async function pageSectionLayout_toolbarStartAcceptsElement() {
        console.log('  PageSectionLayout: toolbarStart slot accepts an element');
        const layout = document.createElement('page-section-layout');
        document.body.appendChild(layout);

        const select = document.createElement('select');
        select.id = 'test-filter';
        layout.toolbarStart = select;

        const found = layout.querySelector('#test-filter');
        assert(found !== null, 'El select debe estar en el slot toolbarStart');

        document.body.removeChild(layout);
    },

    async function pageSectionLayout_contentSlotAcceptsElement() {
        console.log('  PageSectionLayout: content slot accepts an element');
        const layout = document.createElement('page-section-layout');
        document.body.appendChild(layout);

        const table = document.createElement('app-table');
        table.id = 'test-table';
        layout.content = table;

        const found = layout.querySelector('#test-table');
        assert(found !== null, 'La tabla debe estar en el slot content');

        document.body.removeChild(layout);
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

    async function pageSectionLayout_getContentSlot() {
        console.log('  PageSectionLayout: getContentSlot() returns the content div');
        const layout = document.createElement('page-section-layout');
        document.body.appendChild(layout);

        const slot = layout.getContentSlot();
        assert(slot !== null, 'getContentSlot() debe devolver el slot de contenido');
        assert(slot.classList.contains('psl-content'), 'El slot de contenido debe tener clase psl-content');

        document.body.removeChild(layout);
    },

    async function pageSectionLayout_replacesToolbarEnd() {
        console.log('  PageSectionLayout: setting toolbarEnd twice replaces the previous element');
        const layout = document.createElement('page-section-layout');
        document.body.appendChild(layout);

        const btn1 = document.createElement('button');
        btn1.id = 'btn1';
        layout.toolbarEnd = btn1;

        const btn2 = document.createElement('button');
        btn2.id = 'btn2';
        layout.toolbarEnd = btn2;

        assert(layout.querySelector('#btn1') === null, 'El primer botón debe ser reemplazado');
        assert(layout.querySelector('#btn2') !== null, 'El segundo botón debe estar presente');

        document.body.removeChild(layout);
    },

    async function pageSectionLayout_replacesContent() {
        console.log('  PageSectionLayout: setting content twice replaces the previous element');
        const layout = document.createElement('page-section-layout');
        document.body.appendChild(layout);

        const div1 = document.createElement('div');
        div1.id = 'content1';
        layout.content = div1;

        const div2 = document.createElement('div');
        div2.id = 'content2';
        layout.content = div2;

        assert(layout.querySelector('#content1') === null, 'El primer contenido debe ser reemplazado');
        assert(layout.querySelector('#content2') !== null, 'El segundo contenido debe estar presente');

        document.body.removeChild(layout);
    },


    async function pageSectionLayout_toolbarIsHorizontal() {
        console.log('  PageSectionLayout: toolbar is flexbox with space-between');
        const layout = document.createElement('page-section-layout');
        document.body.appendChild(layout);

        const cardHeader = layout.querySelector('.card-header');
        assert(
            cardHeader.classList.contains('justify-content-between'),
            'El toolbar debe tener justify-content-between para alinear filtros a la izquierda y CTA a la derecha'
        );

        document.body.removeChild(layout);
    },

    // ===================================================================
    // UC Home: Home quick-actions use Bootstrap Icons and approved CTAs
    // ===================================================================
    async function home_quickActions_usesBootstrapIconsInTitle() {
        console.log('  Home: título Acciones rápidas usa Bootstrap Icon (bi-lightning-charge)');
        const container = Home();
        const card = Array.from(container.querySelectorAll('.card')).find(c => {
            const title = c.querySelector('h5.card-title');
            return title !== null && title.textContent.includes('Acciones rápidas');
        });
        assert(card !== null, 'Home debe tener un card de Acciones rápidas');
        const title = card.querySelector('h5.card-title');
        assert(title !== null, 'El card de Acciones rápidas debe tener un h5.card-title');
        const icon = title.querySelector('i.bi.bi-lightning-charge');
        assert(icon !== null, 'El título debe tener <i class="bi bi-lightning-charge">');
    },

    async function home_quickActions_ctaAgregarIngreso() {
        console.log('  Home: CTA "Agregar ingreso" apunta a /ingresos con Bootstrap Icon');
        const container = Home();
        const card = Array.from(container.querySelectorAll('.card')).find(c => {
            const title = c.querySelector('h5.card-title');
            return title !== null && title.textContent.includes('Acciones rápidas');
        });
        assert(card !== null, 'Home debe tener un card de Acciones rápidas');
        const ingreso = Array.from(card.querySelectorAll('a[href]')).find(l => l.getAttribute('href') === '/ingresos');
        assert(ingreso !== null, 'Debe existir un enlace a /ingresos');
        assert(ingreso.textContent.includes('Agregar ingreso'), 'CTA debe decir "Agregar ingreso"');
        assert(ingreso.querySelector('i.bi.bi-plus-circle') !== null, 'CTA ingreso debe tener bi-plus-circle');
    },

    async function home_quickActions_ctaAgregarEgreso() {
        console.log('  Home: CTA "Agregar egreso" apunta a /gastos con Bootstrap Icon');
        const container = Home();
        const card = Array.from(container.querySelectorAll('.card')).find(c => {
            const title = c.querySelector('h5.card-title');
            return title !== null && title.textContent.includes('Acciones rápidas');
        });
        assert(card !== null, 'Home debe tener un card de Acciones rápidas');
        const egreso = Array.from(card.querySelectorAll('a[href]')).find(l => l.getAttribute('href') === '/gastos');
        assert(egreso !== null, 'Debe existir un enlace a /gastos');
        assert(egreso.textContent.includes('Agregar egreso'), 'CTA debe decir "Agregar egreso"');
        assert(egreso.querySelector('i.bi.bi-plus-circle') !== null, 'CTA egreso debe tener bi-plus-circle');
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

    async function settings_actions_areNotMixedInSidebarAndBottomNav() {
        console.log('  Layout: Sidebar y BottomNav no mezclan Exportar/Importar/Eliminar en menú de Ajustes');
        const sidebar = document.createElement('app-sidebar');
        const bottomNav = document.createElement('bottom-nav');
        document.body.appendChild(sidebar);
        document.body.appendChild(bottomNav);

        assert(sidebar.querySelector('#sidebar-ajustes-toggle') === null, 'Sidebar no debe mostrar el botón Ajustes en el menú principal');
        assert(sidebar.querySelector('#sidebar-export') === null, 'Sidebar no debe mostrar Exportar en menú actual');
        assert(sidebar.querySelector('#sidebar-import') === null, 'Sidebar no debe mostrar Importar en menú actual');
        assert(sidebar.querySelector('#sidebar-delete') === null, 'Sidebar no debe mezclar Eliminar todo con acciones neutras');

        assert(bottomNav.querySelector('#bottom-nav-ajustes-toggle') === null, 'BottomNav no debe mostrar el botón Ajustes en el menú principal');
        assert(bottomNav.querySelector('#bottom-nav-export') === null, 'BottomNav no debe mostrar Exportar en menú actual');
        assert(bottomNav.querySelector('#bottom-nav-import') === null, 'BottomNav no debe mostrar Importar en menú actual');
        assert(bottomNav.querySelector('#bottom-nav-delete') === null, 'BottomNav no debe mezclar Eliminar todo con acciones neutras');

        document.body.removeChild(sidebar);
        document.body.removeChild(bottomNav);
    },

];
