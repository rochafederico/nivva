// src/components/DuplicateCuotaModal.js
import '../../../shared/components/AppForm.js';

export class DuplicateCuotaModal extends HTMLElement {
    constructor() {
        super();
        this._cuota = null;
    }

    set cuota(data) {
        this._cuota = data || {};
        this.render();
    }
    get cuota() {
        return this._cuota;
    }

    connectedCallback() {
        this.classList.add('d-block');
        this.render();
        this.form = this.querySelector('app-form');
        if (this.form) {
            this.form.addEventListener('duplicate:submit', e => {
                this.dispatchEvent(new CustomEvent('duplicate:save', {
                    detail: e.detail,
                    bubbles: true,
                    composed: true
                }));
            });
            this.form.addEventListener('form:cancel', () => {
                this.dispatchEvent(new CustomEvent('duplicate:cancel', { bubbles: true, composed: true }));
            });
        }
    }

    render() {
        this.innerHTML = '';
        const form = document.createElement('app-form');
        form.fields = [
            { name: 'vencimiento', type: 'date', label: 'Nueva fecha de vencimiento', required: true }
        ];
        // Precargar la fecha dla cuota original si existe
        if (this._cuota && this._cuota.vencimiento) {
            form.initialValues = { vencimiento: this._cuota.vencimiento };
        }
        form.submitText = 'Duplicar';
        form.cancelText = 'Cancelar';
        // Usar evento personalizado para submit
        form.addEventListener('form:submit', e => {
            form.dispatchEvent(new CustomEvent('duplicate:submit', { detail: e.detail, bubbles: true, composed: true }));
        });
        this.appendChild(form);
    }
}
customElements.define('duplicate-cuota-modal', DuplicateCuotaModal);
