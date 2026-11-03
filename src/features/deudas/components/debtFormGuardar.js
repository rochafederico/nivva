// Guardar el egreso: incluye el monto abierto y decide si se envía (spec 002, criterios 9 a 11).
// También los mensajes del bloque de montos, que se suman a DebtForm.prototype.
const esGuardar = (event) => event.target.matches?.('[data-programmatic-submit="true"]');

/**
 * Antes de enviar: intenta cerrar el monto abierto como "Listo" y revisa Acreedor y Tipo de deuda.
 * Si falta algo, no se envía, se marca todo y el foco va al primero en el orden de la ventana.
 */
export function antesDeGuardar(debtForm, event) {
    if (!esGuardar(event)) return;
    const lista = debtForm.montosList;
    if (lista.abierto) lista.abierto.fila.querySelector('app-form').triggerSubmit();
    const campos = ['acreedor', 'tipoDeuda']
        .map((nombre) => debtForm.querySelector(`[name="${nombre}"]`))
        .filter((campo) => campo && !campo.checkValidity());
    if (!lista.abierto && campos.length === 0) return;
    event.preventDefault();
    campos[0]?.focus();
}

export const debtFormErrores = {
    showFormError(msg) {
        const err = this.querySelector('#form-error');
        const montosTableWrapper = this.querySelector('#montos-table-wrapper');
        if (!err || !montosTableWrapper) return;
        err.textContent = msg;
        err.classList.add('d-block');
        err.classList.remove('d-none');
        montosTableWrapper.setAttribute('aria-describedby', 'form-error');
        montosTableWrapper.classList.add('border-danger');
    },

    getMontosRequiredError() {
        return 'Debe agregar al menos un monto antes de guardar.';
    },

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
};
