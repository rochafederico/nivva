import { DeudaModel } from '../DeudaModel.js';
import { el } from '../../../shared/utils/dom.js';
import '../../../shared/components/AppButton.js';
import '../../../shared/components/AppInput.js';
import '../../../shared/components/AppForm.js';
import '../../montos/components/MontoForm.js';
import '../../montos/components/MontosList.js';
import { cerrarAbiertoParaAbrirOtro } from '../../montos/components/montosListaAbierto.js';
import { debtFormAnalitica } from './debtFormAnalitica.js';
import { antesDeGuardar, debtFormErrores } from './debtFormGuardar.js';
import {
    trackFlowStart,
    trackFlowComplete,
    trackFlowError,
    updateFlowStep
} from '../../../shared/observability/index.js';

export class DebtForm extends HTMLElement {
    constructor() {
        super();
        this.montos = [];
        this.editing = false;
        this.deudaId = null;
        this._analyticsFlow = null;
        this._analyticsStep = 'form';
        this._analyticsCompleted = false;
        this._analyticsStartedFor = null;
        this._inlineEditIdx = null;
    }

    connectedCallback() {
        this.classList.add('d-block');
        if (!this._rendered) {
            this._rendered = true;
            this.render();
            this.montosList = this.querySelector('montos-list');
            this._conectarListaMontos();
        }
        this._addMontoBtn = this.querySelector('#add-monto');
        this._onAddMontoClick = (event) => {
            event.stopPropagation();
            this.startAnalyticsFlow(this._getFlowName(), { step: 'monto_list' });
            this.openInlineAdd();
        };
        this._addMontoBtn.removeEventListener('click', this._onAddMontoClick);
        this._addMontoBtn.addEventListener('click', this._onAddMontoClick);
        // Re-attach form listeners on every (re)connect so they survive DOM moves
        this.form = this.querySelector(':scope > app-form');
        this._onSubmit = this.handleSubmit.bind(this);
        this._onCancel = () => this.reset();
        this._onValidationError = (event) => {
            const flowName = this._analyticsFlow || this._getFlowName();
            this.startAnalyticsFlow(flowName, { step: this._analyticsStep });
            const errors = { ...(event.detail?.errors || {}) };
            if (!this.hasMontosAdded() && !this.montosList.abierto) {
                const montosError = this.getMontosRequiredError();
                this.showFormError(montosError);
                errors.montos = montosError;
            } else {
                this.clearFormError();
            }
            trackFlowError(flowName, {
                step: this._analyticsStep,
                errors
            });
        };
        this._onInteraction = () => this.startAnalyticsFlow(this._getFlowName(), { step: this._analyticsStep });
        // En captura: decide antes de que el formulario se envíe (Guardar del pie o Enter).
        this._onGuardar = (event) => antesDeGuardar(this, event);
        this.form.addEventListener('click', this._onGuardar, true);
        this.form.addEventListener('deuda:submit', this._onSubmit);
        this.form.addEventListener('form:cancel', this._onCancel);
        this.form.addEventListener('form:validation-error', this._onValidationError);
        this.form.addEventListener('input', this._onInteraction);
        this.form.addEventListener('change', this._onInteraction);
        this.renderMontosList();
    }

    disconnectedCallback() {
        if (this.form) {
            this.form.removeEventListener('click', this._onGuardar, true);
            this.form.removeEventListener('deuda:submit', this._onSubmit);
            this.form.removeEventListener('form:cancel', this._onCancel);
            this.form.removeEventListener('form:validation-error', this._onValidationError);
            this.form.removeEventListener('input', this._onInteraction);
            this.form.removeEventListener('change', this._onInteraction);
        }
        if (this._addMontoBtn) {
            this._addMontoBtn.removeEventListener('click', this._onAddMontoClick);
        }
    }

    render() {
        const form = document.createElement('app-form');
        form.fields = [
            { name: 'acreedor', type: 'text', label: 'Acreedor', required: true },
            { name: 'tipoDeuda', type: 'text', label: 'Tipo de deuda', required: true },
            { name: 'notas', type: 'textarea', label: 'Notas' }
        ];
        form.submitText = 'Guardar';
        form.cancelText = 'Cancelar';
        form.hideButtons = true;
        // Usar evento personalizado para submit SOLO una vez
        form.addEventListener('form:submit', e => {
            form.dispatchEvent(new CustomEvent('deuda:submit', { detail: e.detail, bubbles: true, composed: true }));
        });
        form.addEventListener('form:cancel', () => this.reset());
        // Lista de montos y botón para agregar
        const montosList = el('div', {
            className: 'montos-list mb-3',
            children: [
                el('div', {
                    className: 'form-label mb-2',
                    attrs: { id: 'montos-label' },
                    children: [
                        el('span', { text: 'Montos' }),
                        el('span', {
                            className: 'text-danger ms-1',
                            text: '*',
                            attrs: { 'aria-hidden': 'true' }
                        })
                    ]
                }),
                el('div', {
                    className: 'bg-body',
                    attrs: {
                        id: 'montos-field',
                        role: 'group',
                        'aria-labelledby': 'montos-label'
                    },
                    children: [
                        el('div', {
                            className: 'border rounded p-3',
                            attrs: { id: 'montos-table-wrapper' },
                            children: [
                                el('montos-list', { attrs: { labelledby: 'montos-label' } })
                            ]
                        }),
                        el('div', {
                            attrs: { id: 'form-error', role: 'alert' },
                            className: 'invalid-feedback mt-2 d-none'
                        }),
                        el('div', {
                            attrs: { id: 'add-monto-btn-row' },
                            className: 'd-flex justify-content-end mt-3',
                            children: [
                                el('app-button', { attrs: { id: 'add-monto', variant: 'secondary' }, text: 'Agregar monto' })
                            ]
                        })
                    ]
                })
            ]
        });
        this.innerHTML = '';
        this.appendChild(form);
        this._applyMobileFirstLayout(form, montosList);
    }

    _applyMobileFirstLayout(appForm, montosList) {
        // app-form re-renderiza cuando cambian initialValues; removemos la copia externa
        // anterior de los campos reordenados antes de volver a mover los wrappers actualizados.
        this.querySelectorAll(':scope > [data-debt-form-field]').forEach(node => {
            node._validationController?.abort();
            node.remove();
        });
        const acreedorField = appForm.querySelector('[data-field-name="acreedor"]');
        const tipoField = appForm.querySelector('[data-field-name="tipoDeuda"]');
        if (!acreedorField || !tipoField) {
            this.appendChild(appForm);
            this.appendChild(montosList);
            return;
        }

        this._prepareReorderedField(acreedorField, 'acreedor');
        this._prepareReorderedField(tipoField, 'tipoDeuda');

        this.appendChild(acreedorField);
        this.appendChild(tipoField);
        this.appendChild(montosList);
        this.appendChild(appForm);
    }

    _prepareReorderedField(fieldWrapper, fieldName) {
        fieldWrapper.classList.remove('mb-2');
        fieldWrapper.classList.add('mb-3');
        fieldWrapper.dataset.debtFormField = fieldName;
        const input = fieldWrapper.querySelector(`[name="${fieldName}"]`);
        const validationController = new AbortController();
        fieldWrapper._validationController = validationController;
        input?.addEventListener('invalid', () => {
            const appForm = this.querySelector(':scope > app-form');
            appForm?.querySelector('form')?.classList.add('was-validated');
            fieldWrapper.classList.add('was-validated');
            appForm?.dispatchEvent(new CustomEvent('form:validation-error', {
                detail: {
                    errors: {
                        [fieldName]: input.validationMessage || 'Campo inválido'
                    }
                },
                bubbles: true,
                composed: true
            }));
        }, { signal: validationController.signal });
        input?.addEventListener('input', () => {
            fieldWrapper.classList.toggle('was-validated', !input.checkValidity());
        }, { signal: validationController.signal });
    }

    hasMontosAdded() {
        return Array.isArray(this.montos) && this.montos.length > 0;
    }

    clearValidationState() {
        this.querySelector(':scope > app-form')?.clearValidationState();
        this.querySelectorAll('[data-debt-form-field].was-validated').forEach(field => {
            field.classList.remove('was-validated');
        });
    }

    // Restablece el formulario a un estado visual limpio al reabrirlo.
    clearErrorState() {
        this.clearValidationState();
        this.clearFormError();
    }

    // Abre un monto nuevo como fila de la lista (spec 002).
    // Nunca hay más de un monto abierto (criterio 12).
    openInlineAdd() {
        if (!cerrarAbiertoParaAbrirOtro(this.montosList)) return;
        this._analyticsStep = 'add_installment';
        updateFlowStep(this._analyticsFlow || this._getFlowName(), this._analyticsStep);
        this._inlineEditIdx = 'new';
        this.renderMontosList();
        this.montosList.abrirMonto();
    }

    // Abre un monto existente en su misma fila (spec 002).
    // Rule: only 1 inline open at a time; if one is already open, ask user via confirm().
    openInlineEdit(monto) {
        if (!cerrarAbiertoParaAbrirOtro(this.montosList)) return;
        this._analyticsStep = 'edit_installment';
        updateFlowStep(this._analyticsFlow || this._getFlowName(), this._analyticsStep);
        this._inlineEditIdx = this.montos.indexOf(monto);
        this.montosList.abrirMonto(monto);
    }

    // La lista "Montos" (spec 001) dibuja, duplica y elimina; el formulario abre la edición.
    _conectarListaMontos() {
        this.montosList.addEventListener('montos:edit', (e) => this.openInlineEdit(e.detail.monto));
        const enfocarAgregar = () => this.querySelector('#add-monto button')?.focus();
        this.montosList.addEventListener('montos:empty', enfocarAgregar);
        this.montosList.addEventListener('montos:cerrado', (e) => {
            this._inlineEditIdx = null;
            if (this.hasMontosAdded()) this.clearFormError();
            if (e.detail.motivo === 'descartado') enfocarAgregar();
        });
        this.montosList.addEventListener('montos:duplicated', (e) => {
            trackFlowStart('duplicate_installment', { step: 'inline_duplicate', deudaId: this.deudaId, source: 'DebtForm' });
            trackFlowComplete('duplicate_installment', { deudaId: this.deudaId, period: e.detail.monto.vencimiento.slice(0, 7) });
        });
    }

    renderMontosList() {
        if (this.hasMontosAdded()) {
            this.clearFormError();
        }
        if (this.montosList) this.montosList.montos = this.montos;
    }

    load(deuda) {
        this.editing = true;
        this.deudaId = deuda.id;
        this.montos = deuda.montos.map(m => ({ ...m }));
        this.montosList?.cerrarMonto();
        this._inlineEditIdx = null;
        this.renderMontosList();
        this.startAnalyticsFlow('edit_debt', { step: 'form', deudaId: deuda.id });
        const form = this.querySelector(':scope > app-form');
        if (form) {
            form.initialValues = {
                acreedor: deuda.acreedor || '',
                tipoDeuda: deuda.tipoDeuda || '',
                notas: deuda.notas || ''
            };
            this._applyMobileFirstLayout(form, this.querySelector('.montos-list'));
        }
        this.clearErrorState();
    }

    reset(options = {}) {
        const { trackAbandonment = true, reason = 'cancel' } = options;
        if (trackAbandonment) {
            this.abandonAnalyticsFlow(reason);
        } else {
            this.clearAnalyticsFlow();
        }
        this.editing = false;
        this.deudaId = null;
        this.montos = [];
        this.montosList?.cerrarMonto();
        this._inlineEditIdx = null;
        const form = this.querySelector(':scope > app-form');
        if (form) {
            form.initialValues = {};
            this._applyMobileFirstLayout(form, this.querySelector('.montos-list'));
        }
        this.renderMontosList();
        this.clearErrorState();
        // Cerrar el modal de deuda si está abierto
        if (this.parentNode && this.parentNode.tagName === 'UI-MODAL' && typeof this.parentNode.close === 'function') {
            this.parentNode.close();
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const flowName = this._analyticsFlow || this._getFlowName();
        this.startAnalyticsFlow(flowName, { step: 'submit' });
        // Los datos del formulario ya están validados por AppForm
        const values = e.detail;
        // Validar que haya al menos un monto
        if (!this.hasMontosAdded()) {
            const montosError = this.getMontosRequiredError();
            this.showFormError(montosError);
            trackFlowError(flowName, {
                step: 'submit',
                errors: { montos: montosError }
            });
            return;
        }
        this.clearFormError();
        const deuda = new DeudaModel({
            id: this.editing ? this.deudaId : undefined,
            acreedor: values.acreedor,
            tipoDeuda: values.tipoDeuda,
            notas: values.notas,
            montos: this.montos
        });
        if (this.editing && this.deudaId) {
            const { updateDeuda } = await import('../deudaRepository.js');
            await updateDeuda(deuda);
            this.dispatchEvent(new CustomEvent('deuda:updated', { detail: deuda, bubbles: true, composed: true }));
            await trackFlowComplete('edit_debt', { deudaId: this.deudaId, montosCount: this.montos.length });
        } else {
            const { addDeuda } = await import('../deudaRepository.js');
            const deudaId = await addDeuda(deuda);
            deuda.id = deudaId;
            this.dispatchEvent(new CustomEvent('deuda:saved', { detail: deuda, bubbles: true, composed: true }));
            await trackFlowComplete('create_debt', { deudaId, montosCount: this.montos.length });
        }
        this._analyticsCompleted = true;
        this.reset({ trackAbandonment: false });
    }
}
Object.assign(DebtForm.prototype, debtFormAnalitica, debtFormErrores);
customElements.define('debt-form', DebtForm);
