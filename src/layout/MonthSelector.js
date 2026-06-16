// src/layout/MonthSelector.js
// Compact global month selector web component — Bootstrap Input Group with input[type=date]
import {
    getSelectedMonth,
    setSelectedMonth,
    goToPreviousMonth,
    goToNextMonth,
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
        group.className = 'd-inline-flex align-items-center gap-1';
        group.dataset.tourStep = 'navegacion-mes';

        const prev = document.createElement('button');
        prev.id = 'ms-prev';
        prev.className = 'btn btn-sm btn-outline-secondary rounded-circle d-inline-flex align-items-center justify-content-center';
        prev.type = 'button';
        prev.title = 'Mes anterior';
        prev.setAttribute('aria-label', 'Mes anterior');
        prev.textContent = '‹';

        const input = document.createElement('input');
        input.id = 'ms-input';
        input.type = 'date';
        input.className = 'visually-hidden-focusable';
        input.value = `${getSelectedMonth()}-01`;
        input.setAttribute('aria-label', 'Seleccionar fecha del mes');
        input.setAttribute('title', 'Seleccionar fecha del mes');

        const next = document.createElement('button');
        next.id = 'ms-next';
        next.className = 'btn btn-sm btn-outline-secondary rounded-circle d-inline-flex align-items-center justify-content-center';
        next.type = 'button';
        next.title = 'Mes siguiente';
        next.setAttribute('aria-label', 'Mes siguiente');
        next.textContent = '›';

        group.appendChild(prev);
        group.appendChild(next);
        group.appendChild(input);

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
                const selectedMonth = e.target.value.slice(0, 7);
                setSelectedMonth(selectedMonth);
                trackEvent('monthly_navigation_used', {
                    direction: 'direct_select',
                    month: selectedMonth
                });
            }
        });
    }

    _syncInput(month) {
        const input = this.querySelector('#ms-input');
        const dateValue = `${month}-01`;
        if (input && input.value !== dateValue) input.value = dateValue;
    }
}

customElements.define('month-selector', MonthSelector);
