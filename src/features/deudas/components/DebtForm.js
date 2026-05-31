import { DeudaModel } from '../DeudaModel.js';
import { el } from '../../../shared/utils/dom.js';
import '../../../shared/components/AppButton.js';
import '../../../shared/components/AppCheckbox.js';
import '../../../shared/components/AppInput.js';
import '../../../shared/components/AppForm.js';
import '../../montos/components/MontoForm.js';
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
        this.montos = [];
        this.editing = false;
        this.deudaId = null;
        this._analyticsFlow = null;
        this._analyticsStep = 'form';
        this._analyticsCompleted = false;
        this._analyticsStartedFor = null;
        // Inline editing state: null = no inline open, 'new' = adding, number = editing existing
        this._inlineEditIdx = null;
        this._inlineEditRef = null; // direct reference to the monto object being edited
    }

    connectedCallback() {
        this.classList.add('d-block');
        if (!this._rendered) {
            this._rendered = true;
            this.render();
            this.montosTbody = this.querySelector('#montos-tbody');
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
        this.form = this.querySelector('app-form');
        this._onSubmit = this.handleSubmit.bind(this);
        this._onCancel = () => this.reset();
        this._onValidationError = (event) => {
            const flowName = this._analyticsFlow || this._getFlowName();
            this.startAnalyticsFlow(flowName, { step: this._analyticsStep });
            const errors = { ...(event.detail?.errors || {}) };
            if (!this.hasMontosAdded()) {
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
        this.form.addEventListener('deuda:submit', this._onSubmit);
        this.form.addEventListener('form:cancel', this._onCancel);
        this.form.addEventListener('form:validation-error', this._onValidationError);
        this.form.addEventListener('input', this._onInteraction);
        this.form.addEventListener('change', this._onInteraction);
        this.renderMontosList();
    }

    disconnectedCallback() {
        if (this.form) {
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
                                                                el('th', { text: 'Monto' }),
                                                                el('th', { text: 'Moneda' }),
                                                                el('th', { text: 'Vencimiento' }),
                                                                el('th', { text: 'Acciones' })
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                el('tbody', { attrs: { id: 'montos-tbody' } })
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
                            attrs: { id: 'add-monto-form-container' },
                            className: 'mt-3 d-none'
                        }),
                        el('div', {
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

    hasMontosAdded() {
        return Array.isArray(this.montos) && this.montos.length > 0;
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

    // Open inline form to add a new monto at the bottom of the table.
    // Rule: only 1 inline open at a time; if one is already open, ask user via confirm().
    openInlineAdd() {
        if (this._inlineEditIdx !== null) {
            if (!confirm('¿Cancelar los cambios actuales?')) return;
            this._inlineEditIdx = null;
            this._inlineEditRef = null;
        }
        this._analyticsStep = 'add_installment';
        updateFlowStep(this._analyticsFlow || this._getFlowName(), this._analyticsStep);
        this._inlineEditIdx = 'new';
        this._inlineEditRef = null;
        this.renderMontosList();
        this._focusFirstInlineInput();
    }

    // Open inline form to edit an existing monto at the given index.
    // Rule: only 1 inline open at a time; if one is already open, ask user via confirm().
    openInlineEdit(monto, idx) {
        if (this._inlineEditIdx !== null) {
            if (!confirm('¿Cancelar los cambios actuales?')) return;
            this._inlineEditIdx = null;
            this._inlineEditRef = null;
        }
        this._analyticsStep = 'edit_installment';
        updateFlowStep(this._analyticsFlow || this._getFlowName(), this._analyticsStep);
        this._inlineEditIdx = idx;
        this._inlineEditRef = monto; // stable reference — survives sort/splice
        this.renderMontosList();
        this._focusFirstInlineInput();
    }

    // Cancel the currently open inline form without saving changes.
    _cancelInline() {
        // montos array was never modified during inline editing, just clear the UI state
        this._inlineEditIdx = null;
        this._inlineEditRef = null;
        this.renderMontosList();
    }

    // Focus the first input/select in the active inline row.
    _focusFirstInlineInput() {
        setTimeout(() => {
            const editInput = this.querySelector('.inline-edit-row input, .inline-edit-row select');
            const addInput = this.querySelector('#add-monto-form-container input, #add-monto-form-container select');
            const input = editInput || addInput;
            if (input) input.focus();
        }, 0);
    }

    // Build the inline monto form (delegates validation to AppForm).
    _buildMontoForm(monto, { inline = false } = {}) {
        const montoFormEl = document.createElement('monto-form');
        if (inline) {
            montoFormEl.inline = true;
        }
        if (monto) {
            // Set before appending so connectedCallback renders with the correct values.
            montoFormEl.monto = {
                monto: monto.monto,
                moneda: monto.moneda,
                vencimiento: monto.vencimiento
            };
        }
        montoFormEl.addEventListener('monto:save', (e) => {
            const existing = this._inlineEditRef;
            const nuevoMonto = {
                monto: parseFloat(e.detail.monto),
                moneda: e.detail.moneda,
                vencimiento: e.detail.vencimiento,
                pagado: existing ? (existing.pagado ?? false) : false,
                ...(existing && existing.id !== undefined ? { id: existing.id } : {})
            };
            if (this._inlineEditIdx === 'new') {
                this.montos.push(nuevoMonto);
            } else {
                const editIdx = this.montos.indexOf(this._inlineEditRef);
                if (editIdx >= 0) this.montos[editIdx] = nuevoMonto;
            }
            this._inlineEditIdx = null;
            this._inlineEditRef = null;
            this.renderMontosList();
        });
        montoFormEl.addEventListener('monto:cancel', () => {
            this._cancelInline();
        });
        return montoFormEl;
    }

    // Build the inline editing row using monto-form (delegates validation to AppForm).
    _buildInlineRow(monto) {
        const montoFormEl = this._buildMontoForm(monto);
        const tr = el('tr', { className: 'inline-edit-row' });
        tr.appendChild(el('td', { attrs: { colspan: '4' }, children: [montoFormEl] }));
        return tr;
    }

    _renderInlineAddForm() {
        const container = this.querySelector('#add-monto-form-container');
        if (!container) return;
        container.innerHTML = '';
        if (this._inlineEditIdx === 'new') {
            container.classList.remove('d-none');
            container.appendChild(this._buildMontoForm(null, { inline: true }));
        } else {
            container.classList.add('d-none');
        }
    }

    // Duplicate a monto in memory: copies monto/moneda/vencimiento, forces pagado=false.
    // No modal is opened (inline only).
    duplicateMonto(monto) {
        trackFlowStart('duplicate_installment', { step: 'inline_duplicate', deudaId: this.deudaId, source: 'DebtForm' });
        const nuevoMonto = { ...monto, pagado: false };
        delete nuevoMonto.id;
        this.montos.push(nuevoMonto);
        this.renderMontosList();
        const nuevoPeriodo = nuevoMonto.vencimiento ? nuevoMonto.vencimiento.slice(0, 7) : '';
        trackFlowComplete('duplicate_installment', { deudaId: this.deudaId, period: nuevoPeriodo });
    }

    renderMontosList() {
        // Ordenar montos por fecha de vencimiento ascendente
        this.montos.sort((a, b) => new Date(a.vencimiento) - new Date(b.vencimiento));
        this.montosTbody.innerHTML = '';
        this._renderInlineAddForm();
        if (this.hasMontosAdded()) {
            this.clearFormError();
        }
        this.montos.forEach((monto, idx) => {
            if (this._inlineEditRef !== null && monto === this._inlineEditRef) {
                // Render inline edit row for this existing monto
                this.montosTbody.appendChild(this._buildInlineRow(monto));
                return;
            }
            const tr = el('tr');
            const cells = [
                { text: monto.monto },
                { text: monto.moneda },
                { text: monto.vencimiento },
                {
                    children: [
                        el('div', {
                            className: 'd-flex gap-1 align-items-center',
                            children: [
                                el('app-button', {
                                    className: 'edit-monto',
                                    text: '✎',
                                    attrs: { title: 'Editar' },
                                    on: {
                                        click: () => this.openInlineEdit(monto, idx)
                                    }
                                }),
                                el('app-button', {
                                    className: 'delete-monto',
                                    text: '×',
                                    attrs: { variant: 'delete', title: 'Eliminar' },
                                    on: {
                                        click: () => {
                                            if (!confirm('¿Seguro quiere eliminar el monto "' + monto.monto + '"?')) return;
                                            this.montos.splice(idx, 1);
                                            this.renderMontosList();
                                        }
                                    }
                                }),
                                el('app-button', {
                                    className: 'duplicate-monto',
                                    text: '⧉',
                                    attrs: { variant: 'success', title: 'Duplicar' },
                                    on: {
                                        click: () => this.duplicateMonto(monto)
                                    }
                                }),
                                (() => {
                                    const idBase = monto.id ?? monto.vencimiento ?? 'monto';
                                    const id = `app-checkbox-${idBase}-${idx}`;
                                    const appCheckbox = document.createElement('app-checkbox');
                                    appCheckbox.inputId = id;
                                    appCheckbox.checked = !!monto.pagado;
                                    appCheckbox.title = 'Marcar como pagado';
                                    appCheckbox.addEventListener('checkbox-change', async (e) => {
                                        monto.pagado = e.detail.checked;
                                    });
                                    return appCheckbox;
                                })()
                            ]
                        })
                    ]
                }
            ];
            cells.forEach(cellOpts => tr.appendChild(el('td', cellOpts)));
            this.montosTbody.appendChild(tr);
        });
    }

    load(deuda) {
        this.editing = true;
        this.deudaId = deuda.id;
        this.montos = deuda.montos.map(m => ({ ...m }));
        this._inlineEditIdx = null;
        this._inlineEditRef = null;
        this.renderMontosList();
        this.startAnalyticsFlow('edit_debt', { step: 'form', deudaId: deuda.id });
        // Precarga los valores en <app-form>
        const form = this.querySelector('app-form');
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
        this._inlineEditIdx = null;
        this._inlineEditRef = null;
        const form = this.querySelector('app-form');
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

    showFormError(msg) {
        const err = this.querySelector('#form-error');
        const montosTableWrapper = this.querySelector('#montos-table-wrapper');
        if (!err || !montosTableWrapper) return;
        err.textContent = msg;
        err.classList.add('d-block');
        err.classList.remove('d-none');
        montosTableWrapper.setAttribute('aria-describedby', 'form-error');
        montosTableWrapper.classList.add('border-danger');
    }

    getMontosRequiredError() {
        return 'Debe agregar al menos un monto antes de guardar.';
    }

    clearFormError() {
        const err = this.querySelector('#form-error');
        const montosTableWrapper = this.querySelector('#montos-table-wrapper');
        if (err) {
            err.textContent = '';
            err.classList.remove('d-block');
            err.classList.add('d-none');
        }
        if (montosTableWrapper) {
            montosTableWrapper.removeAttribute('aria-describedby');
            montosTableWrapper.classList.remove('border-danger');
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
