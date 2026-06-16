// src/layout/ResumenHeader.js
// Global page header: page title + global month selector + subtitle
import './MonthSelector.js';
import { DEFAULT_SUBTITLE } from './navConfig.js';
import { formatMonthLabel, getSelectedMonth } from '../shared/MonthFilter.js';

function formatFeaturedMonth(month) {
    const label = formatMonthLabel(month);
    return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

export default function ResumenHeader({ title = 'Tu panorama financiero', subtitle = DEFAULT_SUBTITLE } = {}) {
    const el = document.createElement('div');
    el.className = 'mb-3';
    el.id = 'resumen-header';

    const titleEl = document.createElement('h1');
    titleEl.className = 'h3 fw-bold mb-1';
    titleEl.id = 'resumen-header-title';
    titleEl.textContent = title;

    const monthLabel = document.createElement('div');
    monthLabel.className = 'h5 fw-semibold mb-0 d-inline-flex align-items-center gap-2';
    monthLabel.id = 'resumen-header-month';
    monthLabel.innerHTML = `<i class="bi bi-calendar-event" aria-hidden="true"></i><span>${formatFeaturedMonth(getSelectedMonth())}</span>`;

    const monthSelector = document.createElement('month-selector');
    monthSelector.classList.add('flex-shrink-0');

    const topRow = document.createElement('div');
    topRow.className = 'd-inline-flex align-items-center gap-2 mb-1';
    topRow.appendChild(monthLabel);
    topRow.appendChild(monthSelector);

    const subtitleEl = document.createElement('p');
    subtitleEl.className = 'text-body-secondary mb-0';
    subtitleEl.id = 'resumen-header-subtitle';
    subtitleEl.textContent = subtitle;

    el.appendChild(topRow);
    el.appendChild(titleEl);
    el.appendChild(subtitleEl);

    el._onUiMonth = (event) => {
        const month = event.detail?.mes || getSelectedMonth();
        monthLabel.querySelector('span').textContent = formatFeaturedMonth(month);
    };
    window.addEventListener('ui:month', el._onUiMonth);

    el.update = ({ title: newTitle, subtitle: newSubtitle, hideMonthSelector } = {}) => {
        if (newTitle !== undefined) {
            el.querySelector('#resumen-header-title').textContent = newTitle;
        }
        if (newSubtitle !== undefined) {
            el.querySelector('#resumen-header-subtitle').textContent = newSubtitle;
        }
        if (hideMonthSelector !== undefined) {
            monthSelector.classList.toggle('d-none', !!hideMonthSelector);
            monthLabel.classList.toggle('d-none', !!hideMonthSelector);
        }
    };

    el.destroy = () => {
        window.removeEventListener('ui:month', el._onUiMonth);
    };

    return el;
}
