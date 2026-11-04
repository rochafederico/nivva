// Ventana "Refinanciar egreso": confirma, guarda y avisa al terminar de cerrarse.
import '../../../shared/components/UiModal.js';
import { hoy, montosAReemplazar } from './RefinanciarForm.js';
import { volverAlFoco } from './volverAlFoco.js';
import { refinanciarEgreso } from '../refinanciarRepository.js';
import { textoConfirmacion, textoGuardado } from '../planCuotas.js';

export class RefinanciarModal extends HTMLElement {
    connectedCallback() {
        if (this.ui) return;
        this.ui = document.createElement('ui-modal');
        this.appendChild(this.ui);
        this.error = Object.assign(document.createElement('div'), { className: 'alert alert-danger py-2 d-none' });
        this.error.setAttribute('role', 'alert');
        this.error.textContent = 'No pudimos guardar la refinanciación. Intentá de nuevo.';
        this.ui.appendChild(this.error);
        this.form = document.createElement('refinanciar-form');
        this.ui.appendChild(this.form);
        this.form.addEventListener('refinanciar:cancel', () => this.ui.close());
        this.form.addEventListener('refinanciar:enviar', (e) => this._guardar(e.detail));
        this.ui.addEventListener('ui-modal:cerrado', () => this._alCerrarse());
    }

    abrir(deuda, opener) {
        this.deuda = deuda;
        this.opener = opener;
        this.ui.setTitle('Refinanciar egreso');
        this.ui.returnFocusTo(opener);
        this.form.preparar(deuda);
        this.error.classList.add('d-none');
        return this.ui.open();
    }

    async _guardar(plan) {
        if (this._guardando) return;
        const reemplazados = montosAReemplazar(this.deuda, plan.moneda).length;
        if (!confirm(textoConfirmacion({ ...plan, acreedor: this.deuda.acreedor, reemplazados }))) return;
        this._guardando = true;
        try {
            await refinanciarEgreso({ ...plan, deudaId: this.deuda.id, fecha: hoy() });
            this._mensaje = textoGuardado(plan);
            this.ui.close();
        } catch (err) {
            console.error('Error al refinanciar', err);
            this.error.classList.remove('d-none');
            this._guardando = false;
        }
    }

    _alCerrarse() {
        this._guardando = false; // hasta acá: un Enter durante el cierre no guarda otra vez
        if (!this._mensaje) return;
        const message = this._mensaje;
        this._mensaje = null;
        window.dispatchEvent(new CustomEvent('deuda:updated', { detail: { id: this.deuda.id } }));
        window.dispatchEvent(new CustomEvent('app:notify', { detail: { message, type: 'success' } }));
        volverAlFoco(this.opener);
    }
}

customElements.define('refinanciar-modal', RefinanciarModal);
