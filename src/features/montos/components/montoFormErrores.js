// Errores del monto abierto: mensaje por campo, mensaje general y foco (spec 002, criterio 8).
export const MONTO_FORM_GENERAL_ERROR_MESSAGE = 'Completá monto, moneda y vencimiento para agregar el monto.';

const MENSAJES_POR_CAMPO = {
    monto: 'Ingresá un monto válido.',
    moneda: 'Seleccioná una moneda.',
    vencimiento: 'Ingresá una fecha válida.'
};

function crearMensajeGeneral(formEl) {
    const mensaje = document.createElement('div');
    mensaje.className = 'invalid-feedback mt-2 d-none';
    mensaje.dataset.montoGeneralError = 'true';
    mensaje.textContent = MONTO_FORM_GENERAL_ERROR_MESSAGE;
    formEl.appendChild(mensaje);
    return mensaje;
}

function limpiarCampoCorregido(campo) {
    if (!campo?.hasAttribute?.('aria-invalid') || !campo.validity.valid) return;
    campo.removeAttribute('aria-invalid');
    campo.removeAttribute('aria-describedby');
}

export function aplicarErroresDelMonto(appForm) {
    const formEl = appForm.querySelector('form');
    if (!formEl) return;

    Object.entries(MENSAJES_POR_CAMPO).forEach(([nombre, texto]) => {
        const feedback = appForm.querySelector(`[data-field-name="${nombre}"] .invalid-feedback`);
        if (feedback) feedback.textContent = texto;
    });

    const mensajeGeneral = crearMensajeGeneral(formEl);
    const ocultarGeneral = () => {
        mensajeGeneral.classList.add('d-none');
        mensajeGeneral.classList.remove('d-block');
    };
    const alEditar = (e) => {
        ocultarGeneral();
        limpiarCampoCorregido(e.target);
    };

    // Sin el globo del navegador: el mensaje de cada campo se ve debajo de él.
    formEl.addEventListener('invalid', (e) => e.preventDefault(), true);

    // El navegador avisa los campos en orden: el primero de cada intento recibe el foco.
    let focoResuelto = false;
    appForm.addEventListener('form:validation-error', (e) => {
        mensajeGeneral.classList.remove('d-none');
        mensajeGeneral.classList.add('d-block');
        if (focoResuelto) return;
        focoResuelto = true;
        const [nombre] = Object.keys(e.detail?.errors || {});
        appForm.querySelector(`[name="${nombre}"]`)?.focus();
        setTimeout(() => { focoResuelto = false; });
    });
    appForm.addEventListener('form:submit', ocultarGeneral);
    appForm.addEventListener('input', alEditar);
    appForm.addEventListener('change', alEditar);
}
