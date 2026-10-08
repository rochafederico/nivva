// src/pages/ResumenMes.js
// Web Component <resumen-mes>: vista única.
// - Deuda total acumulada fija arriba (todas las deudas, sin importar el mes).
// - Dos secciones: "Este mes" (resumen + movimientos Todo · Ingresos · Egresos, con selector de mes)
//   y "Acreedores" (deudas globales, sin selector de mes para no confundir el alcance de los datos).
// - Un único botón flotante (+) abre un bottom sheet para elegir qué registrar.
// La pestaña activa vive en la URL (?vista=…&estado=pendiente), así funcionan Atrás/Adelante y los links.

import '../shared/components/UiModal.js';
import '../features/ingresos/components/IngresoModal.js';
import '../features/ingresos/components/IngresoList.js';
import '../features/deudas/components/DebtModal.js';
import '../features/deudas/components/DebtDetailModal.js';
import '../features/deudas/components/DebtList.js';
import '../features/deudas/components/AcreedoresList.js';
import '../features/deudas/components/DeudaTotal.js';
import StatsIndicators, { DEFAULT_KPI_LINKS } from '../features/stats/components/StatsIndicators.js';

// Filtros de la sección "Este mes"
export const VISTAS = [
    { id: 'todo', label: 'Todo' },
    { id: 'ingresos', label: 'Ingresos' },
    { id: 'egresos', label: 'Egresos' },
];

// Secciones (primer nivel). "acreedores" también es un valor de ?vista.
export const SECCIONES = [
    { id: 'mes', label: 'Este mes' },
    { id: 'acreedores', label: 'Acreedores' },
];

// Tocar un dato del resumen abre el filtro que lo detalla.
export const KPI_LINKS = DEFAULT_KPI_LINKS;

const VISTA_IDS = [...VISTAS.map(v => v.id), 'acreedores'];

/** Lee la pestaña y el filtro desde la query string; valores desconocidos vuelven a "todo". */
export function readVistaState(search = window.location.search) {
    const params = new URLSearchParams(search);
    const requested = params.get('vista');
    const vista = VISTA_IDS.includes(requested) ? requested : 'todo';
    const estado = vista === 'egresos' && params.get('estado') === 'pendiente' ? 'pendiente' : '';
    return { vista, estado };
}

/** URL de una pestaña ("todo" es la raíz). */
export function vistaUrl(vista, estado = '') {
    if (vista === 'todo') return '/';
    return `/?vista=${vista}${estado ? `&estado=${estado}` : ''}`;
}

/** Sección a la que pertenece una vista. */
export function seccionDe(vista) {
    return vista === 'acreedores' ? 'acreedores' : 'mes';
}

function createTablist({ label, items, idPrefix, className }) {
    const tablist = document.createElement('div');
    tablist.className = className;
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', label);
    items.forEach(({ id, label: text }) => {
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.id = `${idPrefix}-${id}`;
        tab.className = 'nav-link';
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', 'vista-panel');
        tab.dataset.value = id;
        tab.textContent = text;
        tablist.appendChild(tab);
    });
    return tablist;
}

export class ResumenMes extends HTMLElement {
    connectedCallback() {
        this.classList.add('d-block');
        this._vista = null;
        this._estado = null;
        this._ultimaVistaMes = 'todo';
        this.render();

        this._onPopState = () => this.applyState(readVistaState());
        // Editar desde el detalle (DebtDetailModal emite deuda:edit)
        this._onEdit = (e) => {
            if (e.detail) this.querySelector('#debtModal')?.openEdit(e.detail);
        };
        window.addEventListener('popstate', this._onPopState);
        window.addEventListener('deuda:edit', this._onEdit);

        this.applyState(readVistaState());
    }

    disconnectedCallback() {
        window.removeEventListener('popstate', this._onPopState);
        window.removeEventListener('deuda:edit', this._onEdit);
        this._fab?.remove();
        // Al salir de la vista el selector de mes vuelve a estar disponible
        window.dispatchEvent(new CustomEvent('ui:month-scope', { detail: { visible: true } }));
    }

    render() {
        this.innerHTML = '';

        // Modales compartidos (fuera del flex para no sumar gaps vacíos)
        const ingresoModal = document.createElement('ingreso-modal');
        ingresoModal.id = 'ingresoModal';
        const debtModal = document.createElement('debt-modal');
        debtModal.id = 'debtModal';
        const detailModal = document.createElement('debt-detail-modal');
        detailModal.id = 'debtDetailModal';
        this.append(ingresoModal, debtModal, detailModal);
        this._sheet = this._renderSheet();

        const root = document.createElement('div');
        root.className = 'd-flex flex-column gap-3';

        // Deuda total acumulada: fija arriba; tocarla lleva a Acreedores
        const deudaTotal = document.createElement('deuda-total');
        root.appendChild(deudaTotal);
        // Delegado: el botón se crea recién cuando el componente se conecta
        deudaTotal.addEventListener('click', (e) => {
            if (e.target.closest('.deuda-total-btn')) this.selectVista('acreedores');
        });

        // Primer nivel: Este mes / Acreedores
        const secciones = createTablist({
            label: 'Secciones', items: SECCIONES, idPrefix: 'seccion-tab', className: 'nav nav-underline seccion-tabs',
        });
        secciones.dataset.tourStep = 'menu-navegacion';
        secciones.addEventListener('click', (e) => {
            const tab = e.target.closest('[role="tab"]');
            if (!tab) return;
            this.selectVista(tab.dataset.value === 'acreedores' ? 'acreedores' : this._ultimaVistaMes);
        });
        secciones.addEventListener('keydown', (e) => this._onTabKeydown(e, secciones, (tab) => {
            this.selectVista(tab.dataset.value === 'acreedores' ? 'acreedores' : this._ultimaVistaMes);
        }));
        root.appendChild(secciones);

        // Sección "Este mes": resumen compacto + filtros
        const mesHeader = document.createElement('div');
        mesHeader.id = 'seccion-mes-header';
        mesHeader.className = 'd-flex flex-column gap-3';
        mesHeader.appendChild(StatsIndicators({ links: KPI_LINKS }));
        const filtros = createTablist({
            label: 'Movimientos del mes', items: VISTAS, idPrefix: 'vista-tab', className: 'nav nav-pills vista-tabs',
        });
        filtros.addEventListener('click', (e) => {
            const tab = e.target.closest('[role="tab"]');
            if (tab) this.selectVista(tab.dataset.value);
        });
        filtros.addEventListener('keydown', (e) => this._onTabKeydown(e, filtros, (tab) => this.selectVista(tab.dataset.value)));
        mesHeader.appendChild(filtros);
        root.appendChild(mesHeader);

        // Panel de la pestaña activa
        const card = document.createElement('div');
        card.className = 'card shadow-sm';
        const panel = document.createElement('div');
        panel.id = 'vista-panel';
        panel.className = 'card-body p-0';
        panel.setAttribute('role', 'tabpanel');
        card.appendChild(panel);
        root.appendChild(card);

        this.appendChild(root);

        // Único botón de alta: abre el bottom sheet para elegir ingreso o egreso
        const fab = document.createElement('button');
        fab.type = 'button';
        fab.id = 'add-fab';
        fab.className = 'btn btn-primary rounded-circle shadow position-fixed d-flex align-items-center justify-content-center add-fab';
        fab.setAttribute('aria-label', 'Agregar movimiento');
        fab.setAttribute('aria-haspopup', 'dialog');
        fab.dataset.tourStep = 'nueva-deuda';
        fab.innerHTML = '<i class="bi bi-plus-lg fs-3" aria-hidden="true"></i>';
        fab.addEventListener('click', () => this.openRegistroSheet());
        this.appendChild(fab);
        this._fab = fab;
    }

    /** Bottom sheet "¿Qué querés agregar?" con las dos opciones de alta. */
    _renderSheet() {
        const sheet = document.createElement('ui-modal');
        sheet.id = 'registro-sheet';
        this.appendChild(sheet);
        sheet.querySelector('.modal-dialog')?.classList.add('modal-sheet');
        sheet.setTitle('¿Qué querés agregar?');

        const options = document.createElement('div');
        options.className = 'list-group list-group-flush registro-opciones';
        options.innerHTML = `
            <button type="button" class="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3" data-registro="ingreso">
                <i class="bi bi-arrow-down-circle fs-3 text-success" aria-hidden="true"></i>
                <span><span class="d-block fw-semibold">Ingreso</span><small class="text-body-secondary">Sueldo, cobros, reintegros</small></span>
            </button>
            <button type="button" class="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3" data-registro="egreso">
                <i class="bi bi-arrow-up-circle fs-3 text-danger" aria-hidden="true"></i>
                <span><span class="d-block fw-semibold">Egreso</span><small class="text-body-secondary">Tarjeta, préstamo, alquiler, servicio</small></span>
            </button>
        `;
        options.addEventListener('click', (e) => {
            const option = e.target.closest('[data-registro]');
            if (option) this._abrirRegistro(option.dataset.registro);
        });
        sheet.appendChild(options);
        return sheet;
    }

    openRegistroSheet() {
        this._sheet.returnFocusTo(this._fab);
        this._sheet.open();
    }

    /** Cierra el sheet y, cuando terminó de cerrarse, abre el formulario elegido. */
    _abrirRegistro(tipo) {
        const abrir = () => {
            const modal = this.querySelector(tipo === 'ingreso' ? '#ingresoModal' : '#debtModal');
            modal.openCreate();
            modal.attachOpener(this._fab);
        };
        const sheetEl = this._sheet._modalEl;
        if (this._sheet._bsModal && sheetEl) {
            sheetEl.addEventListener('hidden.bs.modal', abrir, { once: true });
            this._sheet.close();
        } else {
            this._sheet.close();
            abrir();
        }
    }

    /** Cambia de pestaña y deja la URL lista para compartir y para Atrás/Adelante. */
    selectVista(vista, estado = '') {
        const url = vistaUrl(vista, estado);
        if (url !== window.location.pathname + window.location.search) {
            window.history.pushState({}, '', url);
        }
        this.applyState({ vista, estado });
    }

    applyState({ vista, estado }) {
        if (vista === this._vista && estado === this._estado) return;
        this._vista = vista;
        this._estado = estado;
        const seccion = seccionDe(vista);
        if (seccion === 'mes') this._ultimaVistaMes = vista;

        this._markSelected('#seccion-tab-mes, #seccion-tab-acreedores', `seccion-tab-${seccion}`);
        this._markSelected('.vista-tabs [role="tab"]', seccion === 'mes' ? `vista-tab-${vista}` : null);

        // En Acreedores no aplica el mes: se oculta el resumen mensual, los filtros y el selector de mes
        this.querySelector('#seccion-mes-header').classList.toggle('d-none', seccion !== 'mes');
        window.dispatchEvent(new CustomEvent('ui:month-scope', { detail: { visible: seccion === 'mes' } }));

        const panel = this.querySelector('#vista-panel');
        panel.setAttribute('aria-labelledby', seccion === 'mes' ? `vista-tab-${vista}` : 'seccion-tab-acreedores');
        panel.replaceChildren(...this._panelContent(vista, estado));
    }

    _markSelected(selector, selectedId) {
        this.querySelectorAll(selector).forEach(tab => {
            const selected = tab.id === selectedId;
            tab.classList.toggle('active', selected);
            tab.setAttribute('aria-selected', String(selected));
            tab.tabIndex = selected ? 0 : -1;
        });
        // Si ninguna queda seleccionada (filtros ocultos), la primera sigue alcanzable con teclado
        const tabs = [...this.querySelectorAll(selector)];
        if (tabs.length && !tabs.some(t => t.tabIndex === 0)) tabs[0].tabIndex = 0;
    }

    _panelContent(vista, estado) {
        if (vista === 'ingresos') return [document.createElement('ingreso-list')];
        if (vista === 'acreedores') return [document.createElement('acreedores-list')];

        const list = document.createElement('debt-list');
        list.setAttribute('exclude-columns', 'tipoDeuda');
        list.setAttribute('show-detail-action', '');
        if (vista === 'todo') list.setAttribute('include-ingresos', '');
        if (estado) list.setAttribute('estado', estado);
        if (!estado) return [list];

        // Filtro activo (desde "Por pagar este mes"): aviso con forma de quitarlo
        const filtro = document.createElement('div');
        filtro.className = 'd-flex flex-wrap align-items-center justify-content-between gap-2 px-3 py-2 border-bottom bg-warning-subtle small';
        filtro.innerHTML = `
            <span><i class="bi bi-funnel me-1" aria-hidden="true"></i>Mostrando solo montos pendientes</span>
            <button type="button" class="btn btn-link btn-sm p-0" data-quitar-filtro>Ver todos</button>
        `;
        filtro.querySelector('[data-quitar-filtro]').addEventListener('click', () => this.selectVista('egresos'));
        return [filtro, list];
    }

    _onTabKeydown(e, tablist, activate) {
        const tabs = [...tablist.querySelectorAll('[role="tab"]')];
        const current = tabs.indexOf(document.activeElement);
        if (current === -1) return;
        const next = {
            ArrowRight: (current + 1) % tabs.length,
            ArrowLeft: (current - 1 + tabs.length) % tabs.length,
            Home: 0,
            End: tabs.length - 1,
        }[e.key];
        if (next === undefined) return;
        e.preventDefault();
        tabs[next].focus();
        activate(tabs[next]);
    }
}

customElements.define('resumen-mes', ResumenMes);
