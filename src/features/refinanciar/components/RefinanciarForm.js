// Formulario de la refinanciación: qué se reemplaza. Guardar es de la ventana.
import '../../../shared/components/AppForm.js';
import monedas, { formatMoneda } from '../../../shared/config/monedas.js';

export const montosAReemplazar = (deuda, moneda) => (deuda.montos || []).filter((m) => !m.pagado && m.moneda === moneda);

export class RefinanciarForm extends HTMLElement {
    connectedCallback() {
        this.classList.add('d-block');
        if (this.form) return;
        this.acreedor = Object.assign(document.createElement('p'), { className: 'fw-bold mb-1' });
        this.resumen = Object.assign(document.createElement('p'), { className: 'mb-2' });
        this.form = document.createElement('app-form');
        this.form.cancelText = 'Cancelar';
        this.form.submitText = 'Refinanciar';
        this.form.addEventListener('form:cancel', () => {
            this.dispatchEvent(new CustomEvent('refinanciar:cancel', { bubbles: true, composed: true }));
        });
        this.append(this.acreedor, this.resumen, this.form);
    }

    /** Deja el formulario listo para refinanciar este egreso. */
    preparar(deuda) {
        this.deuda = deuda;
        this.acreedor.textContent = deuda.acreedor;
        this.form.fields = [];
        this.form.querySelector('button[type="submit"]').setAttribute('aria-label', `Refinanciar ${deuda.acreedor}`);
        this._elegirMoneda(monedas.find((m) => montosAReemplazar(deuda, m).length));
    }

    _elegirMoneda(moneda) {
        this.moneda = moneda;
        const montos = montosAReemplazar(this.deuda, moneda);
        const total = montos.reduce((suma, m) => suma + Math.round(Number(m.monto) * 100), 0) / 100;
        const cantidad = montos.length === 1 ? '1 monto' : `${montos.length} montos`;
        this.resumen.textContent = moneda ? `Vas a reemplazar ${cantidad} sin pagar: ${formatMoneda(total, moneda)}` : '';
    }
}

customElements.define('refinanciar-form', RefinanciarForm);
