// Spec 004, criterios 5, 6 y 20: total en vivo, adelanto y errores por campo.
import { assert } from './setup.js';
import '../src/features/refinanciar/components/RefinanciarForm.js';

const DEUDA = { id: 1, acreedor: 'Banco', montos: [{ monto: 100, moneda: 'ARS', pagado: false }] };

function armar(deuda = DEUDA) {
    const form = document.body.appendChild(document.createElement('refinanciar-form'));
    form.preparar(deuda);
    return form;
}
const campo = (form, nombre) => form.querySelector(`[name="${nombre}"]`);
const escribir = (form, nombre, valor) => {
    campo(form, nombre).value = valor;
    campo(form, nombre).dispatchEvent(new Event('input', { bubbles: true }));
};
const aviso = (form, nombre) => form.querySelector(`[data-field-name="${nombre}"] .invalid-feedback`).textContent;
const enviar = (form, detail) => form.form.dispatchEvent(new CustomEvent('form:submit', { detail }));

async function criterio5() {
    console.log('  Criterio 5: el total se lee y se anuncia sin mover el foco');
    const form = armar();
    assert(form.total.getAttribute('role') === 'status' && form.total.textContent === '', 'región presente y vacía');
    campo(form, 'cuotas').focus();
    escribir(form, 'cuotas', '5000, 5000, 4800.50');
    assert(form.total.textContent === '3 cuotas. Total: $ 14.800,50', 'total');
    assert(document.activeElement === campo(form, 'cuotas'), 'el foco no se mueve');
    form.remove();
}

async function criterio6() {
    console.log('  Criterio 6: el adelanto suma su fecha y su texto');
    const form = armar();
    const fecha = campo(form, 'fechaAdelanto').closest('[data-field-name]');
    assert(fecha.classList.contains('d-none'), 'sin adelanto no hay fecha');
    escribir(form, 'cuotas', '5000');
    escribir(form, 'adelanto', '20000');
    assert(!fecha.classList.contains('d-none'), 'aparece la fecha');
    assert(form.total.textContent === '1 cuota. Total: $ 5.000,00. Adelanto: $ 20.000,00.', 'el total suma el adelanto');
    escribir(form, 'adelanto', '');
    assert(fecha.classList.contains('d-none'), 'si se borra, la fecha se va');
    form.remove();
}

async function criterio20() {
    console.log('  Criterio 20: cada campo dice qué le falta y no se envía');
    const deuda = { ...DEUDA, montos: [...DEUDA.montos, { monto: 5, moneda: 'USD', pagado: false }] };
    const form = armar(deuda);
    let enviado = null;
    form.addEventListener('refinanciar:enviar', (e) => { enviado = e.detail; });
    enviar(form, { moneda: '', cuotas: '5.000', primerVencimiento: '', adelanto: '-1', fechaAdelanto: '' });
    assert(enviado === null, 'no sigue');
    assert(aviso(form, 'moneda') === 'Seleccioná una moneda.', 'moneda');
    assert(aviso(form, 'cuotas') === 'Escribí de 1 a 120 cuotas mayores a 0, separadas por coma y sin punto de miles.', 'cuotas');
    assert(aviso(form, 'adelanto') === 'Ingresá un adelanto mayor a 0.', 'adelanto');
    assert(document.activeElement === campo(form, 'moneda'), 'el foco va al primero con error');
    assert(campo(form, 'cuotas').getAttribute('aria-invalid') === 'true', 'marca el campo');
    assert(campo(form, 'cuotas').getAttribute('aria-describedby').includes(form.ayuda.id), 'conserva la ayuda');
    form.remove();
}

async function valido() {
    console.log('  Criterios 5 y 8: lo válido sale con una fecha por cuota');
    const form = armar();
    let enviado = null;
    form.addEventListener('refinanciar:enviar', (e) => { enviado = e.detail; });
    enviar(form, { cuotas: '5000, 4800.50', primerVencimiento: '2027-01-31', adelanto: '', fechaAdelanto: '2026-11-04' });
    assert(enviado?.moneda === 'ARS' && enviado.adelanto === null, 'moneda sin adelanto');
    assert(enviado.cuotas[1].monto === 4800.5 && enviado.cuotas[1].vencimiento === '2027-02-28', 'cuota con su vencimiento');
    form.remove();
}

export const tests = [criterio5, criterio6, criterio20, valido];
