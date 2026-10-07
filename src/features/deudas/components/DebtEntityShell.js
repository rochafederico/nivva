// src/features/deudas/components/DebtEntityShell.js
// Web Component <debt-entity-shell> – vista de deudas con tabs Bootstrap
// Rutas: /gastos (Cuotas del mes) y /gastos/deudas (Deudas)

import '../../../shared/components/AppButton.js';
import '../../../layout/PageSectionLayout.js';
import './DebtModal.js';
import './DebtDetailModal.js';
import './DebtList.js';
import './AcreedoresList.js';
import { getSelectedMonth } from '../../../shared/MonthFilter.js';

function navigate(path) {
    if (path !== window.location.pathname) {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
    }
}

export class DebtEntityShell extends HTMLElement {
    constructor() {
        super();
        this.currentView = this._getViewFromPath();
    }

    _getViewFromPath() {
        return window.location.pathname === '/gastos/deudas' ? 'deudas' : 'cuotas';
    }

    connectedCallback() {
        this.currentView = this._getViewFromPath();
        this.classList.add('d-block');
        this.render();
        this._onRefresh = () => this._refreshCurrentView();
        this._onEdit = (e) => this.editDebt(e.detail);
        window.addEventListener('deuda:saved', this._onRefresh);
        window.addEventListener('deuda:updated', this._onRefresh);
        window.addEventListener('deuda:deleted', this._onRefresh);
        window.addEventListener('data-imported', this._onRefresh);
        window.addEventListener('deuda:edit', this._onEdit);
    }

    disconnectedCallback() {
        window.removeEventListener('deuda:saved', this._onRefresh);
        window.removeEventListener('deuda:updated', this._onRefresh);
        window.removeEventListener('deuda:deleted', this._onRefresh);
        window.removeEventListener('data-imported', this._onRefresh);
        window.removeEventListener('deuda:edit', this._onEdit);
    }

    // La vista Acreedores se recarga sola (<acreedores-list>); Montos del mes usa el filtro global de mes.
    _refreshCurrentView() {
        if (this.currentView === 'cuotas') {
            window.dispatchEvent(new CustomEvent('ui:month', { detail: { mes: getSelectedMonth() } }));
        }
    }

    /** Recarga la lista de acreedores (vista /gastos/deudas). */
    async loadEntities() {
        await this.querySelector('acreedores-list')?.load();
    }

    get entities() {
        return this.querySelector('acreedores-list')?.entities || [];
    }

    async editDebt(deuda) {
        const modal = this.querySelector('#debtModal');
        if (!modal || !deuda) return;
        modal.openEdit(deuda);
    }

    render() {
        this.innerHTML = '';

        // 1. Tabs outside the card (nav-underline), between subtitle and card
        const tabsNav = this._renderTabs();
        this.appendChild(tabsNav);

        // 2. Card layout with CTA only in toolbar
        const layout = document.createElement('page-section-layout');

        // Toolbar end: CTA fijo "Agregar egreso"
        const ctaBtn = document.createElement('app-button');
        ctaBtn.id = 'add-debt';
        ctaBtn.textContent = 'Agregar egreso';
        ctaBtn.addEventListener('click', () => {
            const modal = this.querySelector('#debtModal');
            if (!modal) return;
            modal.openCreate();
            modal.attachOpener(ctaBtn);
        });
        layout.toolbarEnd = ctaBtn;

        // Content: modals + view-specific content
        const contentDiv = document.createElement('div');

        const debtModal = document.createElement('debt-modal');
        debtModal.id = 'debtModal';
        contentDiv.appendChild(debtModal);

        const detailModal = document.createElement('debt-detail-modal');
        detailModal.id = 'debtDetailModal';
        contentDiv.appendChild(detailModal);

        if (this.currentView === 'cuotas') {
            const debtList = document.createElement('debt-list');
            debtList.setAttribute('exclude-columns', 'tipoDeuda');
            debtList.setAttribute('show-detail-action', '');
            contentDiv.appendChild(debtList);
        } else {
            contentDiv.appendChild(document.createElement('acreedores-list'));
        }

        layout.content = contentDiv;
        this.appendChild(layout);

        // 3. Remove default card-body padding so content breathes with external tabs
        const cardBody = layout.querySelector('.card-body');
        if (cardBody) {
            cardBody.classList.remove('p-3');
            cardBody.classList.add('p-0');
        }

        // 4. Move debt-list-totals outside the card for structural separation.
        // DebtList renders debt-list-totals as a child; we relocate it here as a
        // direct sibling of the card so it appears below the list, not inside it.
        if (this.currentView === 'cuotas') {
            const debtListEl = this.querySelector('debt-list');
            if (debtListEl) {
                const totalsEl = debtListEl.querySelector('debt-list-totals');
                if (totalsEl) {
                    this.appendChild(totalsEl);
                    debtListEl.setExternalTotals(totalsEl);
                }
            }
        }
    }

    // Las pestañas son links a rutas (no un tablist ARIA): nav + lista + aria-current.
    _renderTabs() {
        const nav = document.createElement('nav');
        nav.setAttribute('aria-label', 'Vistas de egresos');
        const list = document.createElement('ul');
        list.className = 'nav nav-underline mb-3';
        list.appendChild(this._createTabItem('Montos del mes', '/gastos', this.currentView === 'cuotas'));
        list.appendChild(this._createTabItem('Acreedores', '/gastos/deudas', this.currentView === 'deudas'));
        nav.appendChild(list);
        return nav;
    }

    _createTabItem(label, path, isActive) {
        const li = document.createElement('li');
        li.className = 'nav-item';

        const a = document.createElement('a');
        a.className = `nav-link${isActive ? ' active' : ''}`;
        a.href = path;
        if (isActive) a.setAttribute('aria-current', 'page');
        a.textContent = label;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            navigate(path);
        });

        li.appendChild(a);
        return li;
    }
}

customElements.define('debt-entity-shell', DebtEntityShell);
