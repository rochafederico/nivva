import '../../../shared/components/UiModal.js';
import './GastoForm.js';
import { GastoModel } from '../GastoModel.js';
import { addGasto, updateGasto } from '../gastoRepository.js';
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
        return this._abrir('Agregar gasto', opener, null);
    }

    openEdit(gasto, opener) {
        return this._abrir('Editar gasto', opener, gasto);
    }

    _abrir(titulo, opener, gasto) {
        this._editando = gasto;
        this.ui.setTitle(titulo);
        this.ui.returnFocusTo(opener);
        this.form.preparar(gasto);
        this.error.classList.add('d-none');
        return this.ui.open();
    }

    async _guardar(gasto) {
        if (this._guardando) return;
        this._guardando = true;
        try {
            const modelo = new GastoModel({ ...gasto, id: this._editando?.id });
            this._alCerrar = this._editando ? await this._actualizar(modelo) : await this._agregar(modelo);
            this.ui.close();
        } catch (err) {
            console.error('Error al guardar el gasto', err);
            this.error.classList.remove('d-none');
        } finally {
            this._guardando = false;
        }
    }

    async _agregar(gasto) {
        const id = await addGasto(gasto);
        return { evento: 'gasto:saved', mensaje: this._mensaje('agregado', gasto), detail: { id, gasto, foco: 'agregar' } };
    }

    async _actualizar(gasto) {
        await updateGasto(gasto);
        const foco = gasto.periodo === getSelectedMonth() ? gasto.id : 'agregar';
        return { evento: 'gasto:updated', mensaje: this._mensaje('actualizado', gasto), detail: { id: gasto.id, gasto, foco } };
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
