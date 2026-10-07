// src/layout/ResumenHeader.js
// Global page header: page title + global month selector + subtitle
import './MonthSelector.js';
import { DEFAULT_SUBTITLE } from './navConfig.js';

export const GLOBAL_SCOPE_SUBTITLE = 'Todas tus deudas, sin importar el mes.';

export default function ResumenHeader({ title = 'Tu panorama financiero', subtitle = DEFAULT_SUBTITLE } = {}) {
    const el = document.createElement('div');
    el.className = 'mb-3';
    el.id = 'resumen-header';

    const titleEl = document.createElement('h1');
    titleEl.className = 'h3 fw-bold mb-1';
    titleEl.id = 'resumen-header-title';
    titleEl.textContent = title;

    const monthSelector = document.createElement('month-selector');

    const topRow = document.createElement('div');
    topRow.className = 'mb-1';
    topRow.appendChild(monthSelector);

    const subtitleEl = document.createElement('p');
    subtitleEl.className = 'text-body-secondary mb-0';
    subtitleEl.id = 'resumen-header-subtitle';
    subtitleEl.textContent = subtitle;

    el.appendChild(topRow);
    el.appendChild(titleEl);
    el.appendChild(subtitleEl);


    // Vistas sin alcance mensual (p. ej. Acreedores) ocultan el selector de mes y lo aclaran en el subtítulo.
    let monthlySubtitle = null;
    window.addEventListener('ui:month-scope', (e) => {
        const visible = e.detail?.visible !== false;
        monthSelector.classList.toggle('d-none', !visible);
        if (!visible && monthlySubtitle === null) {
            monthlySubtitle = subtitleEl.textContent;
            subtitleEl.textContent = GLOBAL_SCOPE_SUBTITLE;
        } else if (visible && monthlySubtitle !== null) {
            subtitleEl.textContent = monthlySubtitle;
            monthlySubtitle = null;
        }
    });

    el.update = ({ title: newTitle, subtitle: newSubtitle, hideMonthSelector } = {}) => {
        if (newTitle !== undefined) {
            el.querySelector('#resumen-header-title').textContent = newTitle;
        }
        if (newSubtitle !== undefined) {
            el.querySelector('#resumen-header-subtitle').textContent = newSubtitle;
        }
        if (hideMonthSelector !== undefined) {
            monthSelector.classList.toggle('d-none', !!hideMonthSelector);
        }
    };

    return el;
}
