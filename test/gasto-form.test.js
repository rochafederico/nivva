// Spec 003, criterios 2 y 5: campos, valores iniciales y errores por campo.
import { assert } from './setup.js';
import '../src/features/gastos/components/GastoForm.js';

function armar() {
    const form = document.createElement('gasto-form');
    document.body.appendChild(form);
    return form;
}
const campo = (form, nombre) => form.querySelector(`[name="${nombre}"]`);
const aviso = (form, nombre) => form.querySelector(`[data-field-name="${nombre}"] .invalid-feedback`);
const enviar = (form, detail) => form.form.dispatchEvent(new CustomEvent('form:submit', { detail }));

async function criterio2() {
    console.log('  Criterio 2: pide cuatro campos, con pesos y hoy elegidos');
    const form = armar();
    const nombres = [...form.querySelectorAll('[data-field-name]')].map((c) => c.dataset.fieldName);
    assert(nombres.join() === 'descripcion,monto,moneda,fecha', 'campos en orden, sin acreedor ni vencimiento');
    const etiquetas = [...form.querySelectorAll('label')].map((l) => l.firstChild.textContent);
    assert(etiquetas.join() === 'Descripción,Monto,Moneda,Fecha', 'etiquetas de la spec');
    assert(campo(form, 'moneda').value === 'ARS', 'pesos elegido');
    const d = new Date();
    assert(campo(form, 'fecha').valueAsDate?.getUTCDate() === d.getDate() || campo(form, 'fecha').value.endsWith(String(d.getDate()).padStart(2, '0')), 'fecha de hoy');
    assert(form.querySelector('button[type="submit"]').textContent === 'Agregar gasto', 'botón Agregar gasto');
    form.remove();
}

async function criterio5() {
    console.log('  Criterio 5: cada campo dice qué le falta y lo escrito se conserva');
    const form = armar();
    let enviado = null;
    form.addEventListener('gasto:enviar', (e) => { enviado = e.detail; });
    campo(form, 'descripcion').value = '   ';
    enviar(form, { descripcion: '   ', monto: '0', moneda: '', fecha: 'mal' });
    assert(enviado === null, 'no se guarda');
    assert(aviso(form, 'descripcion').textContent === 'Ingresá una descripción.', 'error de descripción, también solo con espacios');
    assert(aviso(form, 'monto').textContent === 'Ingresá un monto mayor a 0.', 'error de monto');
    assert(aviso(form, 'moneda').textContent === 'Seleccioná una moneda.', 'error de moneda');
    assert(aviso(form, 'fecha').textContent === 'Ingresá una fecha válida.', 'error de fecha');
    const descripcion = campo(form, 'descripcion');
    assert(document.activeElement === descripcion, 'el foco va al primero con error');
    assert(descripcion.getAttribute('aria-invalid') === 'true', 'marca el campo');
    assert(descripcion.getAttribute('aria-describedby') === aviso(form, 'descripcion').id, 'asocia el mensaje');
    assert(descripcion.value === '   ', 'lo escrito se conserva');

    enviar(form, { descripcion: ' Súper ', monto: '5000', moneda: 'USD', fecha: '2026-11-03' });
    assert(!descripcion.hasAttribute('aria-invalid'), 'corregido, se limpia el error');
    assert(enviado?.descripcion === 'Súper' && enviado.monto === 5000 && enviado.moneda === 'USD', 'con datos válidos avisa a la ventana');
    form.remove();
}

export const tests = [criterio2, criterio5];
