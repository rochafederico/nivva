// src/components/MontoForm.js
import monedas from '../../../shared/config/monedas.js';
import '../../../shared/components/AppForm.js';

export const MONTO_FORM_GENERAL_ERROR_MESSAGE = 'Completá monto, moneda y vencimiento para agregar el monto.';

export class MontoForm extends HTMLElement {
    constructor() {
        super();
        this._monto = {};
    }

    set monto(data) {
        this._monto = data || {};
        this.render();
    }
    get monto() {
        return this._monto;
    }

    get inline() {
        return this.hasAttribute('inline');
    }
    set inline(value) {
        if (value) {
            this.setAttribute('inline', '');
        } else {
            this.removeAttribute('inline');
        }
        this.render();
    }

    get compactErrors() {
        return this.hasAttribute('compact-errors');
    }
    set compactErrors(value) {
        if (value) {
            this.setAttribute('compact-errors', '');
        } else {
            this.removeAttribute('compact-errors');
        }
        this.render();
    }

    connectedCallback() {
        this.classList.add('d-block');
        this.render();
        this.form = this.querySelector('app-form');
        if (this.form) {
            this.form.addEventListener('monto:submit', e => {
                this.dispatchEvent(new CustomEvent('monto:save', {
                    detail: e.detail,
                    bubbles: true,
                    composed: true
                }));
            });
            this.form.addEventListener('form:cancel', (e) => {
                e.stopPropagation();
                this.dispatchEvent(new CustomEvent('monto:cancel', { bubbles: true, composed: true }));
            });
        }
    }

    render() {
        this.innerHTML = '';
        const form = document.createElement('app-form');
        form.fields = [
            { name: 'monto', type: 'number', label: 'Monto', required: true, min: 0.01 },
            { name: 'moneda', type: 'select', label: 'Moneda', options: monedas, required: true, placeholder: 'Seleccioná una moneda…' },
            { name: 'vencimiento', type: 'date', label: 'Vencimiento', required: true }
        ];
        form.initialValues = this._monto || {};
        form.submitText = 'Guardar';
        form.cancelText = 'Cancelar';
        // Usar evento personalizado para submit
        form.addEventListener('form:submit', e => {
            form.dispatchEvent(new CustomEvent('monto:submit', { detail: e.detail, bubbles: true, composed: true }));
        });
        if (this.inline) {
            this._applyInlineLayout(form);
        }
        if (this.compactErrors) {
            this._applyCompactErrors(form);
        }
        this.appendChild(form);
    }

    _applyInlineLayout(form) {
        const formEl = form.querySelector('form');
        if (!formEl) return;
        formEl.classList.add('flex-md-row', 'align-items-md-start');
        formEl.querySelectorAll('[data-field-name]').forEach(field => {
            field.classList.remove('mb-2');
            field.classList.add('mb-0', 'flex-fill');
        });
        const cancelBtn = formEl.querySelector('button[type="button"]');
        if (!cancelBtn?.parentElement) return;
        cancelBtn.parentElement.classList.add('mt-md-4', 'flex-shrink-0');
    }

    _applyCompactErrors(form) {
        form.querySelectorAll('.invalid-feedback').forEach(feedbackEl => {
            feedbackEl.classList.add('d-none');
            const input = feedbackEl.previousElementSibling;
            if (!input) return;
            const fieldName = input.name;
            if (fieldName === 'monto') {
                feedbackEl.textContent = 'Ingresá un monto válido.';
            } else if (fieldName === 'moneda') {
                feedbackEl.textContent = 'Seleccioná una moneda.';
            } else if (fieldName === 'vencimiento') {
                feedbackEl.textContent = 'Ingresá una fecha válida.';
            } else {
                feedbackEl.textContent = 'Campo inválido.';
            }
        });

        const formEl = form.querySelector('form');
        if (!formEl) return;
        const generalError = document.createElement('div');
        generalError.className = 'invalid-feedback mt-2 d-none';
        generalError.dataset.montoGeneralError = 'true';
        generalError.textContent = MONTO_FORM_GENERAL_ERROR_MESSAGE;
        formEl.appendChild(generalError);

        const clearGeneralError = () => {
            generalError.classList.add('d-none');
            generalError.classList.remove('d-block');
        };
        const showGeneralError = () => {
            generalError.classList.remove('d-none');
            generalError.classList.add('d-block');
        };
        form.addEventListener('form:validation-error', showGeneralError);
        form.addEventListener('form:submit', clearGeneralError);
        form.addEventListener('input', clearGeneralError);
        form.addEventListener('change', clearGeneralError);
    }
}
customElements.define('monto-form', MontoForm);
