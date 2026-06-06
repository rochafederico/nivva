import { DeudaModel } from '../DeudaModel.js';
import { el } from '../../../shared/utils/dom.js';
import '../../../shared/components/AppButton.js';
import '../../../shared/components/AppCheckbox.js';
import '../../../shared/components/AppInput.js';
import '../../../shared/components/AppForm.js';
import '../../cuotas/components/CuotaForm.js';
import {
    trackFlowStart,
    trackFlowComplete,
    trackFlowError,
    trackFlowAbandoned,
    updateFlowStep
} from '../../../shared/observability/index.js';

export class DebtForm extends HTMLElement {
    constructor() {
        super();
        this.cuotas = [];
        this.editing = false;
        this.deudaId = null;
        this._analyticsFlow = null;
        this._analyticsStep = 'form';
        this._analyticsCompleted = false;
        this._analyticsStartedFor = null;
        // Amount section mode: idle (list), creating, editing
        this._amountMode = 'idle';
        // Inline editing state: null = no inline open, 'new' = adding, number = editing existing
        this._inlineEditIdx = null;
        this._inlineEditRef = null; // direct reference to the cuota object being edited
    }

    connectedCallback() {
        this.classList.add('d-block');
        if (!this._rendered) {
            this._rendered = true;
            this.render();
            this.cuotasTbody = this.querySelector('#cuotas-tbody');
        }
        this._addCuotaBtn = this.querySelector('#add-cuota');
        this._onAddCuotaClick = (event) => {
            event.stopPropagation();
            this.startAnalyticsFlow(this._getFlowName(), { step: 'cuota_list' });
            this.openInlineAdd();
        };
        this._addCuotaBtn.removeEventListener('click', this._onAddCuotaClick);
        this._addCuotaBtn.addEventListener('click', this._onAddCuotaClick);
        // Re-attach form listeners on every (re)connect so they survive DOM moves
        this.form = this.querySelector('app-form');
        this._onSubmit = this.handleSubmit.bind(this);
        this._onCancel = () => this.reset();
        this._onValidationError = (event) => {
            const flowName = this._analyticsFlow || this._getFlowName();
            this.startAnalyticsFlow(flowName, { step: this._analyticsStep });
            const errors = { ...(event.detail?.errors || {}) };
            if (!this.hasCuotasAdded()) {
                const cuotasError = this.getCuotasRequiredError();
                this.showFormError(cuotasError);
                errors.cuotas = cuotasError;
            } else {
                this.clearFormError();
            }
            trackFlowError(flowName, {
                step: this._analyticsStep,
                errors
            });
        };
        this._onInteraction = () => this.startAnalyticsFlow(this._getFlowName(), { step: this._analyticsStep });
        this.form.addEventListener('deuda:submit', this._onSubmit);
        this.form.addEventListener('form:cancel', this._onCancel);
        this.form.addEventListener('form:validation-error', this._onValidationError);
        this.form.addEventListener('input', this._onInteraction);
        this.form.addEventListener('change', this._onInteraction);
        this.renderCuotasList();
    }

    disconnectedCallback() {
        if (this.form) {
            this.form.removeEventListener('deuda:submit', this._onSubmit);
            this.form.removeEventListener('form:cancel', this._onCancel);
            this.form.removeEventListener('form:validation-error', this._onValidationError);
            this.form.removeEventListener('input', this._onInteraction);
            this.form.removeEventListener('change', this._onInteraction);
        }
        if (this._addCuotaBtn) {
            this._addCuotaBtn.removeEventListener('click', this._onAddCuotaClick);
        }
    }

    render() {
        // Formulario principal con <app-form>
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
        // Restaurar el listener para cancelar
        form.addEventListener('form:cancel', () => this.reset());
        // Lista de cuotas y botón para agregar
        const cuotasList = el('div', {
            className: 'cuotas-list mb-3',
            children: [
                el('div', {
                    className: 'form-label mb-2',
                    attrs: { id: 'cuotas-label' },
                    children: [
                        el('span', { text: 'Cuotas' }),
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
                        id: 'cuotas-field',
                        role: 'group',
                        'aria-labelledby': 'cuotas-label'
                    },
                    children: [
                        el('div', {
                            className: 'border rounded p-3',
                            attrs: { id: 'cuotas-table-wrapper' },
                            children: [
                                el('div', {
                                    className: 'overflow-auto',
                                    style: 'min-height: 100px; max-height: 220px;',
                                    children: [
                                        el('table', {
                                            className: 'table table-sm w-100 mb-0',
                                            children: [
                                                el('thead', {
                                                    children: [
                                                        el('tr', {
                                                            children: [
                                                                el('th', { text: 'Cuota' }),
                                                                el('th', { text: 'Moneda' }),
                                                                el('th', { text: 'Vencimiento' }),
                                                                el('th', { text: 'Acciones' })
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                el('tbody', { attrs: { id: 'cuotas-tbody' } })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),
                        el('div', {
                            attrs: { id: 'form-error' },
                            className: 'invalid-feedback mt-2 d-none'
                        }),
                        el('div', {
                            attrs: { id: 'cuota-form-title' },
                            className: 'fw-semibold mt-3 mb-2 d-none'
                        }),
                        el('div', {
                            attrs: { id: 'add-cuota-form-container' },
                            className: 'mt-3 d-none'
                        }),
                        el('div', {
                            attrs: { id: 'add-cuota-btn-row' },
                            className: 'd-flex justify-content-end mt-3',
                            children: [
                                el('app-button', { attrs: { id: 'add-cuota', variant: 'secondary' }, text: 'Agregar cuota' })
                            ]
                        })
                    ]
                })
            ]
        });
        this.innerHTML = '';
        this.appendChild(form);
        this._applyMobileFirstLayout(form, cuotasList);
    }

    _applyMobileFirstLayout(appForm, cuotasList) {
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
            this.appendChild(cuotasList);
            return;
        }

        this._prepareReorderedField(acreedorField, 'acreedor');
        this._prepareReorderedField(tipoField, 'tipoDeuda');

        this.appendChild(acreedorField);
        this.appendChild(tipoField);
        this.appendChild(cuotasList);
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
            const appForm = this.querySelector('app-form');
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

    hasCuotasAdded() {
        return Array.isArray(this.cuotas) && this.cuotas.length > 0;
    }

    clearValidationState() {
        this.querySelector('app-form')?.clearValidationState();
        this.querySelectorAll('[data-debt-form-field].was-validated').forEach(field => {
            field.classList.remove('was-validated');
        });
    }

    // Restablece el formulario a un estado visual limpio al reabrirlo.
    clearErrorState() {
        this.clearValidationState();
        this.clearFormError();
    }

    // Open inline form to add a new cuota at the bottom of the table.
    // Rule: only 1 inline open at a time; if one is already open, ask user via confirm().
    openInlineAdd() {
        if (this._inlineEditIdx !== null) {
            if (!confirm('¿Cancelar los cambios actuales?')) return;
            this._inlineEditIdx = null;
            this._inlineEditRef = null;
        }
        this._analyticsStep = 'add_installment';
        updateFlowStep(this._analyticsFlow || this._getFlowName(), this._analyticsStep);
        this._amountMode = 'creating';
        this._inlineEditIdx = 'new';
        this._inlineEditRef = null;
        this.renderCuotasList();
        this._focusFirstInlineInput();
    }

    // Open inline form to edit an existing cuota at the given index.
    // Rule: only 1 inline open at a time; if one is already open, ask user via confirm().
    openInlineEdit(cuota, idx) {
        if (this._inlineEditIdx !== null) {
            if (!confirm('¿Cancelar los cambios actuales?')) return;
            this._inlineEditIdx = null;
            this._inlineEditRef = null;
        }
        this._analyticsStep = 'edit_installment';
        updateFlowStep(this._analyticsFlow || this._getFlowName(), this._analyticsStep);
        this._amountMode = 'editing';
        this._inlineEditIdx = idx;
        this._inlineEditRef = cuota; // stable reference — survives sort/splice
        this.renderCuotasList();
        this._focusFirstInlineInput();
    }

    // Cancel the currently open inline form without saving changes.
    _cancelInline() {
        // cuotas array was never modified during inline editing, just clear the UI state
        this._amountMode = 'idle';
        this._inlineEditIdx = null;
        this._inlineEditRef = null;
        this.renderCuotasList();
    }

    // Focus the first input/select in the active cuota form container.
    _focusFirstInlineInput() {
        setTimeout(() => {
            const selector = '#add-cuota-form-container input, #add-cuota-form-container select';
            const input = this.querySelector(selector);
            if (input) input.focus();
        }, 0);
    }

    // Build the inline cuota form (delegates validation to AppForm).
    _buildCuotaForm(cuota, { inline = false } = {}) {
        const cuotaFormEl = document.createElement('cuota-form');
        if (inline) {
            cuotaFormEl.inline = true;
        }
        cuotaFormEl.compactErrors = true;
        if (cuota) {
            // Set before appending so connectedCallback renders with the correct values.
            cuotaFormEl.cuota = {
                cuota: cuota.cuota,
                moneda: cuota.moneda,
                vencimiento: cuota.vencimiento
            };
        }
        cuotaFormEl.addEventListener('cuota:save', (e) => {
            const existing = this._inlineEditRef;
            const nuevoCuota = {
                cuota: parseFloat(e.detail.cuota),
                moneda: e.detail.moneda,
                vencimiento: e.detail.vencimiento,
                pagado: existing ? (existing.pagado ?? false) : false,
                ...(existing && existing.id !== undefined ? { id: existing.id } : {})
            };
            if (this._inlineEditIdx === 'new') {
                this.cuotas.push(nuevoCuota);
            } else {
                const editIdx = this.cuotas.indexOf(this._inlineEditRef);
                if (editIdx >= 0) this.cuotas[editIdx] = nuevoCuota;
            }
            this._amountMode = 'idle';
            this._inlineEditIdx = null;
            this._inlineEditRef = null;
            this.renderCuotasList();
        });
        cuotaFormEl.addEventListener('cuota:cancel', () => {
            this._cancelInline();
        });
        return cuotaFormEl;
    }

    _renderInlineAddForm() {
        const container = this.querySelector('#add-cuota-form-container');
        const title = this.querySelector('#cuota-form-title');
        const tableWrapper = this.querySelector('#cuotas-table-wrapper');
        const addCuotaBtnRow = this.querySelector('#add-cuota-btn-row');
        if (!container) return;
        container.innerHTML = '';
        if (this._amountMode === 'creating') {
            container.classList.remove('d-none');
            title?.classList.remove('d-none');
            if (title) title.textContent = 'Nuevo cuota';
            tableWrapper?.classList.add('d-none');
            addCuotaBtnRow?.classList.add('d-none');
            container.appendChild(this._buildCuotaForm(null, { inline: true }));
        } else if (this._amountMode === 'editing' && this._inlineEditRef) {
            container.classList.remove('d-none');
            title?.classList.remove('d-none');
            if (title) title.textContent = 'Editar cuota';
            tableWrapper?.classList.add('d-none');
            addCuotaBtnRow?.classList.add('d-none');
            container.appendChild(this._buildCuotaForm(this._inlineEditRef, { inline: true }));
        } else {
            title?.classList.add('d-none');
            container.classList.add('d-none');
            tableWrapper?.classList.remove('d-none');
            addCuotaBtnRow?.classList.remove('d-none');
        }
    }

    // Duplicate a cuota in memory: copies cuota/moneda/vencimiento, forces pagado=false.
    // No modal is opened (inline only).
    duplicateCuota(cuota) {
        trackFlowStart('duplicate_installment', { step: 'inline_duplicate', deudaId: this.deudaId, source: 'DebtForm' });
        const nuevoCuota = { ...cuota, pagado: false };
        delete nuevoCuota.id;
        this.cuotas.push(nuevoCuota);
        this.renderCuotasList();
        const nuevoPeriodo = nuevoCuota.vencimiento ? nuevoCuota.vencimiento.slice(0, 7) : '';
        trackFlowComplete('duplicate_installment', { deudaId: this.deudaId, period: nuevoPeriodo });
    }

    renderCuotasList() {
        // Ordenar cuotas por fecha de vencimiento ascendente
        this.cuotas.sort((a, b) => new Date(a.vencimiento) - new Date(b.vencimiento));
        this.cuotasTbody.innerHTML = '';
        this._renderInlineAddForm();
        if (this.hasCuotasAdded()) {
            this.clearFormError();
        }
        this.cuotas.forEach((cuota, idx) => {
            const tr = el('tr');
            const cells = [
                { text: cuota.cuota },
                { text: cuota.moneda },
                { text: cuota.vencimiento },
                {
                    children: [
                        el('div', {
                            className: 'd-flex gap-1 align-items-center',
                            children: [
                                el('app-button', {
                                    className: 'edit-cuota',
                                    text: '✎',
                                    attrs: { title: 'Editar' },
                                    on: {
                                        click: () => this.openInlineEdit(cuota, idx)
                                    }
                                }),
                                el('app-button', {
                                    className: 'delete-cuota',
                                    text: '×',
                                    attrs: { variant: 'delete', title: 'Eliminar' },
                                    on: {
                                        click: () => {
                                            if (!confirm('¿Seguro quiere eliminar la cuota "' + cuota.cuota + '"?')) return;
                                            this.cuotas.splice(idx, 1);
                                            this.renderCuotasList();
                                        }
                                    }
                                }),
                                el('app-button', {
                                    className: 'duplicate-cuota',
                                    text: '⧉',
                                    attrs: { variant: 'success', title: 'Duplicar' },
                                    on: {
                                        click: () => this.duplicateCuota(cuota)
                                    }
                                }),
                                (() => {
                                    const idBase = cuota.id ?? cuota.vencimiento ?? 'cuota';
                                    const id = `app-checkbox-${idBase}-${idx}`;
                                    const appCheckbox = document.createElement('app-checkbox');
                                    appCheckbox.inputId = id;
                                    appCheckbox.checked = !!cuota.pagado;
                                    appCheckbox.title = 'Marcar como pagado';
                                    appCheckbox.addEventListener('checkbox-change', async (e) => {
                                        cuota.pagado = e.detail.checked;
                                    });
                                    return appCheckbox;
                                })()
                            ]
                        })
                    ]
                }
            ];
            cells.forEach(cellOpts => tr.appendChild(el('td', cellOpts)));
            this.cuotasTbody.appendChild(tr);
        });
    }

    load(deuda) {
        this.editing = true;
        this.deudaId = deuda.id;
        this.cuotas = deuda.cuotas.map(m => ({ ...m }));
        this._amountMode = 'idle';
        this._inlineEditIdx = null;
        this._inlineEditRef = null;
        this.renderCuotasList();
        this.startAnalyticsFlow('edit_debt', { step: 'form', deudaId: deuda.id });
        // Precarga los valores en <app-form>
        const form = this.querySelector('app-form');
        if (form) {
            form.initialValues = {
                acreedor: deuda.acreedor || '',
                tipoDeuda: deuda.tipoDeuda || '',
                notas: deuda.notas || ''
            };
            this._applyMobileFirstLayout(form, this.querySelector('.cuotas-list'));
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
        this.cuotas = [];
        this._amountMode = 'idle';
        this._inlineEditIdx = null;
        this._inlineEditRef = null;
        const form = this.querySelector('app-form');
        if (form) {
            form.initialValues = {};
            this._applyMobileFirstLayout(form, this.querySelector('.cuotas-list'));
        }
        this.renderCuotasList();
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
        // Validar que haya al menos una cuota
        if (!this.hasCuotasAdded()) {
            const cuotasError = this.getCuotasRequiredError();
            this.showFormError(cuotasError);
            trackFlowError(flowName, {
                step: 'submit',
                errors: { cuotas: cuotasError }
            });
            return;
        }
        this.clearFormError();
        const deuda = new DeudaModel({
            id: this.editing ? this.deudaId : undefined,
            acreedor: values.acreedor,
            tipoDeuda: values.tipoDeuda,
            notas: values.notas,
            cuotas: this.cuotas
        });
        if (this.editing && this.deudaId) {
            const { updateDeuda } = await import('../deudaRepository.js');
            await updateDeuda(deuda);
            this.dispatchEvent(new CustomEvent('deuda:updated', { detail: deuda, bubbles: true, composed: true }));
            await trackFlowComplete('edit_debt', { deudaId: this.deudaId, cuotasCount: this.cuotas.length });
        } else {
            const { addDeuda } = await import('../deudaRepository.js');
            const deudaId = await addDeuda(deuda);
            deuda.id = deudaId;
            this.dispatchEvent(new CustomEvent('deuda:saved', { detail: deuda, bubbles: true, composed: true }));
            await trackFlowComplete('create_debt', { deudaId, cuotasCount: this.cuotas.length });
        }
        this._analyticsCompleted = true;
        this.reset({ trackAbandonment: false });
    }

    showFormError(msg) {
        const err = this.querySelector('#form-error');
        const cuotasTableWrapper = this.querySelector('#cuotas-table-wrapper');
        if (!err || !cuotasTableWrapper) return;
        err.textContent = msg;
        err.classList.add('d-block');
        err.classList.remove('d-none');
        cuotasTableWrapper.setAttribute('aria-describedby', 'form-error');
        cuotasTableWrapper.classList.add('border-danger');
    }

    getCuotasRequiredError() {
        return 'Debe agregar al menos una cuota antes de guardar.';
    }

    clearFormError() {
        const err = this.querySelector('#form-error');
        const cuotasTableWrapper = this.querySelector('#cuotas-table-wrapper');
        if (err) {
            err.textContent = '';
            err.classList.remove('d-block');
            err.classList.add('d-none');
        }
        if (cuotasTableWrapper) {
            cuotasTableWrapper.removeAttribute('aria-describedby');
            cuotasTableWrapper.classList.remove('border-danger');
        }
    }

    startAnalyticsFlow(flowName, metadata = {}) {
        if (!flowName) return;
        this._analyticsFlow = flowName;
        this._analyticsStep = metadata.step || this._analyticsStep || 'form';
        updateFlowStep(flowName, this._analyticsStep, metadata);
        if (this._analyticsStartedFor === flowName) return;
        this._analyticsStartedFor = flowName;
        this._analyticsCompleted = false;
        trackFlowStart(flowName, metadata);
    }

    abandonAnalyticsFlow(reason = 'cancel') {
        if (!this._analyticsFlow || this._analyticsCompleted) {
            this.clearAnalyticsFlow();
            return;
        }
        trackFlowAbandoned(this._analyticsFlow, this._analyticsStep, { deudaId: this.deudaId, reason });
        this.clearAnalyticsFlow();
    }

    clearAnalyticsFlow() {
        this._analyticsFlow = null;
        this._analyticsStep = 'form';
        this._analyticsCompleted = false;
        this._analyticsStartedFor = null;
    }

    _getFlowName() {
        return this.editing ? 'edit_debt' : 'create_debt';
    }
}
customElements.define('debt-form', DebtForm);
