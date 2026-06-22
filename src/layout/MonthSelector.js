// src/layout/MonthSelector.js
// Global month selector web component — Bootstrap-only layout with native month input.
import {
    getSelectedMonth,
    setSelectedMonth,
    goToPreviousMonth,
    goToNextMonth,
    formatMonthLabel,
} from '../shared/MonthFilter.js';
import { trackEvent } from '../shared/observability/index.js';

export class MonthSelector extends HTMLElement {
    connectedCallback() {
        this.classList.add('d-inline-flex', 'align-items-center');
        this._render();
        this._onUiMonth = (e) => this._syncInput(e.detail.mes);
        window.addEventListener('ui:month', this._onUiMonth);
    }

    disconnectedCallback() {
        window.removeEventListener('ui:month', this._onUiMonth);
    }

    _render() {
        const group = document.createElement('div');
        group.className = 'd-flex align-items-stretch gap-2 mb-3';
        group.dataset.tourStep = 'navegacion-mes';

        const prev = document.createElement('button');
        prev.id = 'ms-prev';
        prev.className = 'btn btn-primary px-3 fs-4 lh-1 flex-shrink-0';
        prev.type = 'button';
        prev.title = 'Mes anterior';
        prev.setAttribute('aria-label', 'Mes anterior');
        prev.textContent = '‹';

        const center = document.createElement('label');
        center.className = 'form-control form-control-lg d-flex align-items-center justify-content-center gap-2 position-relative overflow-hidden m-0 fw-semibold text-nowrap';
        center.setAttribute('for', 'ms-input');

        const icon = document.createElement('span');
        icon.className = 'text-secondary flex-shrink-0';
        icon.innerHTML = '<i class="bi bi-calendar-event" aria-hidden="true"></i>';

        const label = document.createElement('span');
        label.id = 'ms-label';
        label.className = 'text-truncate text-capitalize';
        label.textContent = formatMonthLabel(getSelectedMonth());

        const input = document.createElement('input');
        input.id = 'ms-input';
        input.type = 'month';
        input.className = 'form-control position-absolute top-0 start-0 w-100 h-100 opacity-0';
        input.value = getSelectedMonth();
        input.setAttribute('aria-label', 'Seleccionar mes');

        const next = document.createElement('button');
        next.id = 'ms-next';
        next.className = 'btn btn-primary px-3 fs-4 lh-1 flex-shrink-0';
        next.type = 'button';
        next.title = 'Mes siguiente';
        next.setAttribute('aria-label', 'Mes siguiente');
        next.textContent = '›';

        center.appendChild(icon);
        center.appendChild(label);
        center.appendChild(input);
        group.appendChild(prev);
        group.appendChild(center);
        group.appendChild(next);

        this.innerHTML = '';
        this.appendChild(group);
        this.querySelector('#ms-prev').addEventListener('click', () => {
            goToPreviousMonth();
            trackEvent('monthly_navigation_used', {
                direction: 'previous',
                month: getSelectedMonth()
            });
        });
        this.querySelector('#ms-next').addEventListener('click', () => {
            goToNextMonth();
            trackEvent('monthly_navigation_used', {
                direction: 'next',
                month: getSelectedMonth()
            });
        });
        this.querySelector('#ms-input').addEventListener('change', (e) => {
            if (e.target.value) {
                setSelectedMonth(e.target.value);
                trackEvent('monthly_navigation_used', {
                    direction: 'direct_select',
                    month: e.target.value
                });
            }
        });
    }

    _syncInput(month) {
        const input = this.querySelector('#ms-input');
        const label = this.querySelector('#ms-label');
        if (input && input.value !== month) input.value = month;
        if (label) label.textContent = formatMonthLabel(month);
    }
}

customElements.define('month-selector', MonthSelector);
