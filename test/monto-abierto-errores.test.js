// Spec 002 · T01: botones del monto abierto, errores por campo y foco (criterio 8).
import { assert } from './setup.js';
import '../src/features/montos/components/MontoForm.js';

function abrir(numero) {
    const form = document.createElement('monto-form');
    form.inline = true;
    form.compactErrors = true;
    form.numero = numero;
    document.body.appendChild(form);
    return form;
}
const campo = (form, nombre) => form.querySelector(`[name="${nombre}"]`);
const listo = (form) => form.querySelector('button[type="submit"]');
const cancelar = (form) => form.querySelector('#cancelBtn');

async function testNombres() {
    console.log('  Spec 002 T01: "Listo" y "Cancelar" con sus nombres');
    const nuevo = abrir('nuevo');
    assert(listo(nuevo).textContent === 'Listo' && cancelar(nuevo).textContent === 'Cancelar', 'Textos visibles');
    assert(listo(nuevo).getAttribute('aria-label') === 'Listo, monto nuevo', 'Listo en monto nuevo');
    assert(cancelar(nuevo).getAttribute('aria-label') === 'Cancelar monto nuevo', 'Cancelar en monto nuevo');
    nuevo.remove();
    const tercero = abrir(3);
    assert(listo(tercero).getAttribute('aria-label') === 'Listo, monto 3', 'Listo en monto 3');
    assert(cancelar(tercero).getAttribute('aria-label') === 'Cancelar cambios del monto 3', 'Cancelar en monto 3');
    tercero.remove();
}

async function testErrores() {
    console.log('  Spec 002 C8: mensajes por campo, mensaje general y foco en el primero');
    const form = abrir('nuevo');
    let guardado = false;
    form.addEventListener('monto:save', () => { guardado = true; });
    listo(form).click();
    assert(!guardado, 'La fila sigue abierta');
    Object.entries({ monto: 'Ingresá un monto válido.', moneda: 'Seleccioná una moneda.', vencimiento: 'Ingresá una fecha válida.' }).forEach(([nombre, texto]) => {
        const mensaje = document.getElementById(campo(form, nombre).getAttribute('aria-describedby'));
        assert(mensaje?.textContent === texto && !mensaje.classList.contains('d-none'), `Mensaje visible de ${nombre}`);
    });
    assert(form.querySelector('[data-monto-general-error="true"]').classList.contains('d-block'), 'Mensaje general');
    assert(document.activeElement === campo(form, 'monto'), 'Foco en el primer campo con problema');

    campo(form, 'monto').step = 'any'; // happy-dom calcula mal el step con decimales
    campo(form, 'monto').value = '100';
    campo(form, 'monto').dispatchEvent(new Event('input', { bubbles: true }));
    assert(campo(form, 'monto').getAttribute('aria-invalid') === null, 'Al corregir se limpia la marca');
    await new Promise((resolve) => setTimeout(resolve));
    listo(form).click();
    assert(document.activeElement === campo(form, 'moneda'), 'El foco pasa al siguiente con problema');
    form.remove();
}

export const tests = [testNombres, testErrores];
