// Formulario de gasto: campos, valores iniciales y errores. Guardar es de la ventana.
import '../../../shared/components/AppForm.js';
import monedas from '../../../shared/config/monedas.js';
import { gastoFormErrores, mostrarErrores } from './gastoFormErrores.js';

const CAMPOS = [
    { name: 'descripcion', label: 'Descripción', type: 'text', required: true },
    { name: 'monto', label: 'Monto', type: 'number', required: true, min: 0.01 },
    { name: 'moneda', label: 'Moneda', type: 'select', options: monedas, required: true },
    { name: 'fecha', label: 'Fecha', type: 'date', required: true },
];

function hoy() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export class GastoForm extends HTMLElement {
    connectedCallback() {
        this.classList.add('d-block');
        if (this.form) return;
        this.form = document.createElement('app-form');
        this.form.fields = CAMPOS;
        this.form.cancelText = 'Cancelar';
        this.form.addEventListener('form:submit', (e) => this._alEnviar(e.detail));
        this.form.addEventListener('form:cancel', () => {
            this.dispatchEvent(new CustomEvent('gasto:cancel', { bubbles: true, composed: true }));
        });
        this.appendChild(this.form);
        this.preparar();
    }

    /** Deja el formulario listo para agregar un gasto nuevo. */
    preparar() {
        this.form.submitText = 'Agregar gasto';
        this.form.initialValues = { moneda: 'ARS', fecha: hoy() };
        this._ordenar();
    }

    _alEnviar(valores) {
        if (mostrarErrores(this.form, gastoFormErrores(valores))) return;
        const gasto = { ...valores, descripcion: valores.descripcion.trim(), monto: Number(valores.monto) };
        this.dispatchEvent(new CustomEvent('gasto:enviar', { detail: gasto, bubbles: true, composed: true }));
    }

    // Sin validación nativa: cada campo dice su error. Monto y moneda van en la misma fila.
    _ordenar() {
        const formEl = this.form.querySelector('form');
        formEl.noValidate = true;
        const [descripcion, monto, moneda, fecha] = CAMPOS.map(({ name }) => formEl.querySelector(`[data-field-name="${name}"]`));
        const fila = document.createElement('div');
        fila.className = 'row g-2 align-items-start';
        monto.className = 'mb-0 col-8 align-self-start';
        moneda.className = 'mb-0 col-4 align-self-start';
        fila.append(monto, moneda);
        formEl.prepend(descripcion, fila, fecha);
    }
}

customElements.define('gasto-form', GastoForm);
