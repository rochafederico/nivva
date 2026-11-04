// Validación del formulario de gasto: qué le falta a cada campo y cómo mostrarlo.
import monedas from '../../../shared/config/monedas.js';

export function fechaValida(fecha) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '')) return false;
    const d = new Date(`${fecha}T12:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === fecha;
}

export function gastoFormErrores({ descripcion, monto, moneda, fecha } = {}) {
    const errores = {};
    if (!String(descripcion ?? '').trim()) errores.descripcion = 'Ingresá una descripción.';
    if (!(Number(monto) > 0)) errores.monto = 'Ingresá un monto mayor a 0.';
    if (!monedas.includes(moneda)) errores.moneda = 'Seleccioná una moneda.';
    if (!fechaValida(fecha)) errores.fecha = 'Ingresá una fecha válida.';
    return errores;
}

/** Marca cada campo con su error y deja el foco en el primero. Devuelve si hubo errores. */
export function mostrarErrores(appForm, errores) {
    let primero = null;
    appForm.querySelectorAll('[data-field-name]').forEach((campo) => {
        const nombre = campo.dataset.fieldName;
        const input = campo.querySelector(`[name="${nombre}"]`);
        const aviso = campo.querySelector('.invalid-feedback');
        const mensaje = errores[nombre];
        input.classList.toggle('is-invalid', Boolean(mensaje));
        if (mensaje) {
            aviso.textContent = mensaje;
            input.setAttribute('aria-invalid', 'true');
            input.setAttribute('aria-describedby', aviso.id);
            primero = primero || input;
        } else {
            input.removeAttribute('aria-invalid');
            input.removeAttribute('aria-describedby');
        }
    });
    primero?.focus();
    return Boolean(primero);
}
