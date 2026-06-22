// src/layout/MonthSelector.js
// Global month selector web component — Bootstrap input group with side navigation.
import {
    getSelectedMonth,
    setSelectedMonth,
    goToPreviousMonth,
    goToNextMonth,
} from '../shared/MonthFilter.js';
import { trackEvent } from '../shared/observability/index.js';

export class MonthSelector extends HTMLElement {
    connectedCallback() {
        this.classList.remove('d-inline-flex');
        this.classList.add('d-flex', 'align-items-center', 'col-12', 'col-md-6', 'col-lg-5');
        this._render();
        this._onUiMonth = (e) => this._syncInput(e.detail.mes);
        window.addEventListener('ui:month', this._onUiMonth);
    }

    disconnectedCallback() {
        window.removeEventListener('ui:month', this._onUiMonth);
    }

    _render() {
        const group = document.createElement('div');
        group.className = 'd-flex align-items-stretch gap-2 mb-3 w-100';
        group.dataset.tourStep = 'navegacion-mes';

        const prev = document.createElement('button');
        prev.id = 'ms-prev';
        prev.className = 'btn btn-primary px-3 fs-4 lh-1 flex-shrink-0';
        prev.type = 'button';
        prev.title = 'Mes anterior';
        prev.setAttribute('aria-label', 'Mes anterior');
        prev.textContent = '‹';

        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group flex-grow-1 w-100';
        inputGroup.style.minWidth = '0';

        const icon = document.createElement('span');
        icon.className = 'input-group-text';
        icon.innerHTML = '<i class="bi bi-calendar-event" aria-hidden="true"></i>';

        const input = document.createElement('input');
        input.id = 'ms-input';
        input.type = 'month';
        input.className = 'form-control';
        input.style.minWidth = '0';
        input.value = getSelectedMonth();
        input.setAttribute('aria-label', 'Seleccionar mes');

        const next = document.createElement('button');
        next.id = 'ms-next';
        next.className = 'btn btn-primary px-3 fs-4 lh-1 flex-shrink-0';
        next.type = 'button';
        next.title = 'Mes siguiente';
        next.setAttribute('aria-label', 'Mes siguiente');
        next.textContent = '›';

        inputGroup.appendChild(icon);
        inputGroup.appendChild(input);
        group.appendChild(prev);
        group.appendChild(inputGroup);
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
        if (input && input.value !== month) input.value = month;
    }
}

customElements.define('month-selector', MonthSelector);
