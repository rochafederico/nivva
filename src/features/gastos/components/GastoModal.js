import '../../../shared/components/UiModal.js';
import './GastoForm.js';
import { GastoModel } from '../GastoModel.js';
import { addGasto } from '../gastoRepository.js';
import { getSelectedMonth } from '../../../shared/MonthFilter.js';
import { mesHablado } from '../../montos/utils/montoHablado.js';

export class GastoModal extends HTMLElement {
    connectedCallback() {
        if (this.ui) return;
        this.ui = document.createElement('ui-modal');
        this.appendChild(this.ui);
        this.error = Object.assign(document.createElement('div'), { className: 'alert alert-danger py-2 d-none' });
        this.error.setAttribute('role', 'alert');
        this.error.textContent = 'No pudimos guardar el gasto. Intentá de nuevo.';
        this.ui.appendChild(this.error);
        this.form = document.createElement('gasto-form');
        this.ui.appendChild(this.form);
        this.form.addEventListener('gasto:enviar', (e) => this._guardar(e.detail));
        this.form.addEventListener('gasto:cancel', () => this.ui.close());
        this.ui.addEventListener('ui-modal:cerrado', () => this._alCerrarse());
    }

    openCreate(opener) {
        this.ui.setTitle('Agregar gasto');
        this.ui.returnFocusTo(opener);
        this.form.preparar();
        this.error.classList.add('d-none');
        return this.ui.open();
    }

    async _guardar(gasto) {
        if (this._guardando) return;
        this._guardando = true;
        try {
            const modelo = new GastoModel(gasto);
            const id = await addGasto(modelo);
            this._alCerrar = { evento: 'gasto:saved', mensaje: this._mensaje('agregado', modelo), detail: { id, gasto: modelo, foco: 'agregar' } };
            this.ui.close();
        } catch (err) {
            console.error('Error al guardar el gasto', err);
            this.error.classList.remove('d-none');
        } finally {
            this._guardando = false;
        }
    }

    _mensaje(accion, { periodo }) {
        return periodo === getSelectedMonth() ? `Gasto ${accion}.` : `Gasto ${accion} en ${mesHablado(periodo)}.`;
    }

    _alCerrarse() {
        if (!this._alCerrar) return;
        const { evento, mensaje, detail } = this._alCerrar;
        this._alCerrar = null;
        window.dispatchEvent(new CustomEvent(evento, { detail }));
        window.dispatchEvent(new CustomEvent('app:notify', { detail: { message: mensaje, type: 'success' } }));
    }
}

customElements.define('gasto-modal', GastoModal);
