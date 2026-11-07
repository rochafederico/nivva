// Ventana "Refinanciar egreso".
import '../../../shared/components/UiModal.js';
import './RefinanciarForm.js';

export class RefinanciarModal extends HTMLElement {
    connectedCallback() {
        if (this.ui) return;
        this.ui = document.createElement('ui-modal');
        this.appendChild(this.ui);
        this.form = document.createElement('refinanciar-form');
        this.ui.appendChild(this.form);
        this.form.addEventListener('refinanciar:cancel', () => this.ui.close());
    }

    abrir(deuda, opener) {
        this.deuda = deuda;
        this.ui.setTitle('Refinanciar egreso');
        this.ui.returnFocusTo(opener);
        this.form.preparar(deuda);
        return this.ui.open();
    }
}

customElements.define('refinanciar-modal', RefinanciarModal);
