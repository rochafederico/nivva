// Formulario de la refinanciación: qué se reemplaza y los campos. Guardar es de la ventana.
import '../../../shared/components/AppForm.js';
import monedas, { formatMoneda } from '../../../shared/config/monedas.js';

const CAMPOS = [
    { name: 'moneda', label: 'Moneda a refinanciar', type: 'select', placeholder: 'Seleccioná una moneda', required: true },
    { name: 'cuotas', label: 'Cuotas, separadas por coma', type: 'text', required: true },
    { name: 'primerVencimiento', label: 'Primer vencimiento', type: 'date', required: true },
    { name: 'adelanto', label: 'Adelantar capital (opcional)', type: 'number', min: 0.01 },
    { name: 'fechaAdelanto', label: 'Fecha del adelanto', type: 'date' },
];

function hoy() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

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
        this.form.addEventListener('change', (e) => {
            if (e.target.name === 'moneda') this._elegirMoneda(e.target.value);
        });
        this.append(this.acreedor, this.resumen, this.form);
    }

    /** Deja el formulario listo para refinanciar este egreso. */
    preparar(deuda) {
        this.deuda = deuda;
        this.acreedor.textContent = deuda.acreedor;
        const opciones = monedas.filter((m) => montosAReemplazar(deuda, m).length);
        const campos = opciones.length > 1
            ? CAMPOS.map((c) => (c.name === 'moneda' ? { ...c, options: opciones } : c))
            : CAMPOS.filter((c) => c.name !== 'moneda');
        this.form.fields = campos;
        this.form.initialValues = { fechaAdelanto: hoy() };
        const formEl = this.form.querySelector('form');
        formEl.querySelector('[data-field-name="fechaAdelanto"]').classList.add('d-none');
        formEl.querySelector('button[type="submit"]').setAttribute('aria-label', `Refinanciar ${deuda.acreedor}`);
        this._elegirMoneda(opciones.length > 1 ? '' : opciones[0]);
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
