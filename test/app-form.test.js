import { assert } from './setup.js';

export const tests = [
    async function appForm_rendersRequiredIndicatorsAndNativeAttributes() {
        console.log('  AppForm: renders required indicators and native validation attributes');
        const appForm = document.createElement('app-form');
        appForm.fields = [
            { name: 'acreedor', type: 'text', label: 'Acreedor', required: true },
            { name: 'monto', type: 'number', label: 'Monto', required: true, min: 0.01 },
            { name: 'moneda', type: 'select', label: 'Moneda', options: ['ARS', 'USD'], required: true, placeholder: 'Seleccioná una moneda…' }
        ];
        document.body.appendChild(appForm);

        const labels = appForm.querySelectorAll('.form-label');
        assert(labels[0].textContent.includes('Acreedor'), 'Debe renderizar el label Acreedor');
        assert(labels[0].querySelector('.text-danger') !== null, 'Debe mostrar asterisco en campo requerido');

        const select = appForm.querySelector('select[name="moneda"]');
        const montoInput = appForm.querySelector('input[name="monto"]');
        assert(select !== null, 'Debe renderizar el select requerido');
        assert(select.options[0].value === '', 'El select requerido debe tener opción placeholder vacía');
        assert(select.options[0].textContent === 'Seleccioná una moneda…', 'El placeholder del select debe coincidir');
        assert(montoInput.getAttribute('min') === '0.01', 'El input numérico debe exponer min nativo');
        assert(montoInput.required === true, 'El input numérico debe usar required nativo');

        document.body.removeChild(appForm);
    },

    async function appForm_invalidSubmitUsesNativeHtmlValidation() {
        console.log('  AppForm: invalid submit relies on native HTML validation');
        const appForm = document.createElement('app-form');
        appForm.fields = [
            { name: 'acreedor', type: 'text', label: 'Acreedor', required: true },
            { name: 'monto', type: 'number', label: 'Monto', required: true, min: 0.01 },
            { name: 'moneda', type: 'select', label: 'Moneda', options: ['ARS', 'USD'], required: true, placeholder: 'Seleccioná una moneda…' }
        ];
        document.body.appendChild(appForm);

        const form = appForm.querySelector('form');
        const montoInput = appForm.querySelector('input[name="monto"]');
        const acreedorInput = appForm.querySelector('input[name="acreedor"]');
        const monedaSelect = appForm.querySelector('select[name="moneda"]');
        let submitEvent = null;
        appForm.addEventListener('form:submit', e => { submitEvent = e; });
        montoInput.value = '0';

        appForm.triggerSubmit();

        assert(submitEvent === null, 'No debe emitir form:submit si el formulario es inválido');
        assert(form.classList.contains('was-validated'), 'El formulario debe usar la clase de Bootstrap tras un intento inválido');
        assert(acreedorInput.validity.valueMissing === true, 'Acreedor debe quedar inválido por required nativo');
        assert(montoInput.validity.rangeUnderflow === true, 'Monto debe quedar inválido por min nativo');
        assert(monedaSelect.validity.valueMissing === true, 'Moneda debe quedar inválida por required nativo');
        assert(!acreedorInput.classList.contains('is-invalid'), 'No debe inyectar clases is-invalid manuales');

        document.body.removeChild(appForm);
    },

    async function appForm_validSubmitEmitsFormSubmit() {
        console.log('  AppForm: valid submit emits form:submit with values');
        const appForm = document.createElement('app-form');
        appForm.fields = [
            { name: 'acreedor', type: 'text', label: 'Acreedor', required: true },
            { name: 'moneda', type: 'select', label: 'Moneda', options: ['ARS', 'USD'], required: true, placeholder: 'Seleccioná una moneda…' }
        ];
        document.body.appendChild(appForm);

        const acreedorInput = appForm.querySelector('input[name="acreedor"]');
        const monedaSelect = appForm.querySelector('select[name="moneda"]');
        let submitEvent = null;
        appForm.addEventListener('form:submit', e => { submitEvent = e; });

        acreedorInput.value = 'Banco Galicia';
        monedaSelect.value = 'ARS';
        appForm.triggerSubmit();

        assert(submitEvent !== null, 'Debe emitir form:submit cuando el formulario es válido');
        assert(submitEvent.detail.acreedor === 'Banco Galicia', 'Debe incluir acreedor en el payload');
        assert(submitEvent.detail.moneda === 'ARS', 'Debe incluir moneda en el payload');

        document.body.removeChild(appForm);
    },

    async function appForm_hiddenButtonsCanStillSubmitValidForm() {
        console.log('  AppForm: triggerSubmit works when buttons are hidden');
        const appForm = document.createElement('app-form');
        appForm.fields = [
            { name: 'acreedor', type: 'text', label: 'Acreedor', required: true }
        ];
        appForm.hideButtons = true;
        document.body.appendChild(appForm);

        const input = appForm.querySelector('input[name="acreedor"]');
        const hiddenSubmit = appForm.querySelector('[data-programmatic-submit="true"]');
        let submitEvent = null;
        appForm.addEventListener('form:submit', e => { submitEvent = e; });

        assert(hiddenSubmit !== null, 'Debe renderizar un submit programático oculto cuando hideButtons=true');

        input.value = 'Banco Galicia';
        appForm.triggerSubmit();

        assert(submitEvent !== null, 'Debe emitir form:submit aunque los botones visibles estén ocultos');
        assert(submitEvent.detail.acreedor === 'Banco Galicia', 'Debe incluir el valor del campo asociado al formulario');

        document.body.removeChild(appForm);
    },

    async function appForm_clearValidationStateRemovesBootstrapValidationClass() {
        console.log('  AppForm: clearValidationState removes stale Bootstrap validation state');
        const appForm = document.createElement('app-form');
        appForm.fields = [
            { name: 'acreedor', type: 'text', label: 'Acreedor', required: true }
        ];
        document.body.appendChild(appForm);

        const form = appForm.querySelector('form');
        appForm.triggerSubmit();
        assert(form.classList.contains('was-validated'), 'El formulario debe quedar validado tras un envío inválido');

        appForm.clearValidationState();

        assert(!form.classList.contains('was-validated'), 'clearValidationState debe limpiar la clase was-validated');

        document.body.removeChild(appForm);
    },

    async function appForm_rendersInvalidFeedbackPerField() {
        console.log('  AppForm: renders invalid-feedback elements with field-specific messages');
        const appForm = document.createElement('app-form');
        appForm.fields = [
            { name: 'acreedor', type: 'text', label: 'Acreedor', required: true },
            { name: 'monto', type: 'number', label: 'Monto', required: true, min: 0.01 },
            { name: 'moneda', type: 'select', label: 'Moneda', options: ['ARS', 'USD'], required: true, placeholder: 'Seleccioná una moneda…' },
            { name: 'fecha', type: 'date', label: 'Fecha', required: true }
        ];
        document.body.appendChild(appForm);

        const acreedorWrapper = appForm.querySelector('[data-field-name="acreedor"]');
        const montoWrapper = appForm.querySelector('[data-field-name="monto"]');
        const monedaWrapper = appForm.querySelector('[data-field-name="moneda"]');
        const fechaWrapper = appForm.querySelector('[data-field-name="fecha"]');

        assert(acreedorWrapper.querySelector('.invalid-feedback') !== null, 'Acreedor debe tener elemento invalid-feedback');
        assert(montoWrapper.querySelector('.invalid-feedback') !== null, 'Monto debe tener elemento invalid-feedback');
        assert(monedaWrapper.querySelector('.invalid-feedback') !== null, 'Moneda debe tener elemento invalid-feedback');
        assert(fechaWrapper.querySelector('.invalid-feedback') !== null, 'Fecha debe tener elemento invalid-feedback');

        assert(acreedorWrapper.querySelector('.invalid-feedback').textContent === 'Este campo es obligatorio.', 'Mensaje de texto requerido correcto');
        assert(montoWrapper.querySelector('.invalid-feedback').textContent.includes('número'), 'Mensaje numérico menciona número');
        assert(monedaWrapper.querySelector('.invalid-feedback').textContent.includes('opción'), 'Mensaje de select menciona opción');
        assert(fechaWrapper.querySelector('.invalid-feedback').textContent.includes('fecha'), 'Mensaje de fecha menciona fecha');

        document.body.removeChild(appForm);
    },

    async function appForm_setsAriaInvalidOnInvalidSubmit() {
        console.log('  AppForm: sets aria-invalid and aria-describedby on invalid fields after submit');
        const appForm = document.createElement('app-form');
        appForm.fields = [
            { name: 'acreedor', type: 'text', label: 'Acreedor', required: true }
        ];
        document.body.appendChild(appForm);

        const acreedorInput = appForm.querySelector('input[name="acreedor"]');
        assert(acreedorInput.getAttribute('aria-invalid') === null, 'aria-invalid no debe estar presente antes de submit inválido');

        appForm.triggerSubmit();

        assert(acreedorInput.getAttribute('aria-invalid') === 'true', 'aria-invalid debe ser "true" tras submit inválido');
        assert(acreedorInput.getAttribute('aria-describedby') !== null, 'aria-describedby debe apuntar al mensaje de error');

        appForm.clearValidationState();
        assert(acreedorInput.getAttribute('aria-invalid') === null, 'clearValidationState debe limpiar aria-invalid');
        assert(acreedorInput.getAttribute('aria-describedby') === null, 'clearValidationState debe limpiar aria-describedby');

        document.body.removeChild(appForm);
    }
];
