// src/layout/MonthSelector.js
// Compact global month selector web component with fixed mobile controls
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
        const label = document.createElement('label');
        label.className = 'visually-hidden';
        label.htmlFor = 'period-selector';
        label.textContent = 'Período';

        const group = document.createElement('div');
        group.className = 'period-selector mb-3';
        group.dataset.tourStep = 'navegacion-mes';

        const icon = document.createElement('span');
        icon.className = 'period-selector__icon input-group-text';
        icon.innerHTML = '<i class="bi bi-calendar-event" aria-hidden="true"></i>';

        const input = document.createElement('input');
        input.id = 'period-selector';
        input.type = 'month';
        input.className = 'period-selector__input form-control form-control-lg';
        input.value = getSelectedMonth();
        input.setAttribute('aria-label', 'Seleccionar período');

        const actions = document.createElement('div');
        actions.className = 'period-selector__actions';
        actions.setAttribute('aria-label', 'Navegación de período');

        const prev = document.createElement('button');
        prev.id = 'ms-prev';
        prev.className = 'period-selector__button btn btn-primary';
        prev.type = 'button';
        prev.title = 'Mes anterior';
        prev.setAttribute('aria-label', 'Mes anterior');
        prev.textContent = '‹';

        const next = document.createElement('button');
        next.id = 'ms-next';
        next.className = 'period-selector__button btn btn-primary';
        next.type = 'button';
        next.title = 'Mes siguiente';
        next.setAttribute('aria-label', 'Mes siguiente');
        next.textContent = '›';

        actions.appendChild(prev);
        actions.appendChild(next);
        group.appendChild(icon);
        group.appendChild(input);
        group.appendChild(actions);

        this.innerHTML = '';
        this.appendChild(label);
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
        this.querySelector('#period-selector').addEventListener('change', (e) => {
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
        const input = this.querySelector('#period-selector');
        if (input && input.value !== month) input.value = month;
    }
}

customElements.define('month-selector', MonthSelector);
