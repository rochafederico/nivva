// src/layout/MonthSelector.js
// Global month selector web component — centered native input with side navigation.
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
        group.className = 'month-selector-control mb-3';
        group.dataset.tourStep = 'navegacion-mes';

        const prev = document.createElement('button');
        prev.id = 'ms-prev';
        prev.className = 'btn btn-primary month-selector-arrow';
        prev.type = 'button';
        prev.title = 'Mes anterior';
        prev.setAttribute('aria-label', 'Mes anterior');
        prev.textContent = '‹';

        const center = document.createElement('label');
        center.className = 'month-selector-period';
        center.setAttribute('for', 'ms-input');

        const icon = document.createElement('span');
        icon.className = 'month-selector-calendar';
        icon.innerHTML = '<i class="bi bi-calendar-event" aria-hidden="true"></i>';

        const label = document.createElement('span');
        label.id = 'ms-label';
        label.className = 'month-selector-label';
        label.textContent = formatMonthLabel(getSelectedMonth());

        const input = document.createElement('input');
        input.id = 'ms-input';
        input.type = 'month';
        input.className = 'form-control month-selector-native-input';
        input.value = getSelectedMonth();
        input.setAttribute('aria-label', 'Seleccionar mes');

        const next = document.createElement('button');
        next.id = 'ms-next';
        next.className = 'btn btn-primary month-selector-arrow';
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
