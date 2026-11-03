// Spec 002 · T05: un solo monto abierto a la vez (criterio 12).
import { assert } from './setup.js';
import '../src/features/deudas/components/DebtForm.js';

function montar() {
    const form = document.createElement('debt-form');
    document.body.appendChild(form);
    form.montos = [{ monto: 100, moneda: 'ARS', vencimiento: '2026-11-10' }, { monto: 200, moneda: 'ARS', vencimiento: '2026-12-10' }];
    form.renderMontosList();
    return form;
}
const filas = (form) => [...form.querySelectorAll('montos-list ul[role="list"] > li')];
const abiertos = (form) => form.querySelectorAll('montos-list monto-form');
const campo = (form, nombre) => form.querySelector(`montos-list monto-form [name="${nombre}"]`);
const agregar = (form) => form.querySelector('#add-monto button');
const editar = (fila) => {
    const menu = fila.querySelector('menu-button'); menu.open(0);
    [...menu.items].find((item) => item.textContent.trim() === 'Editar').click();
};
function sinPregunta(accion) {
    const original = global.confirm;
    let preguntas = 0;
    global.confirm = () => { preguntas += 1; return true; };
    accion();
    global.confirm = original;
    assert(preguntas === 0, 'No aparece "¿Cancelar los cambios actuales?"');
}

async function testCompletoSeAplica() {
    console.log('  Spec 002 C12: con el abierto completo, se aplica y se abre el otro');
    const form = montar();
    editar(filas(form)[0]);
    campo(form, 'monto').value = '150';
    sinPregunta(() => editar(filas(form)[1]));
    assert(abiertos(form).length === 1, 'Hay un solo monto abierto');
    assert(form.montos[0].monto === 150, 'Se aplicó lo escrito');
    assert(filas(form)[1].contains(abiertos(form)[0]), 'Se abrió el otro');
    form.remove();
}

async function testIncompletoNoAbreOtro() {
    console.log('  Spec 002 C12: con el abierto incompleto, el otro no se abre y se ven sus errores');
    const form = montar();
    editar(filas(form)[0]);
    campo(form, 'monto').value = '';
    sinPregunta(() => agregar(form).click());
    assert(abiertos(form).length === 1 && filas(form).length === 2, 'No se abre otro');
    assert(campo(form, 'monto').getAttribute('aria-invalid') === 'true', 'Muestra su error');
    assert(document.activeElement === campo(form, 'monto'), 'Foco en el campo con problema');
    form.remove();
}

async function testNuevoVacioSeDescarta() {
    console.log('  Spec 002 C12: un monto nuevo vacío se descarta sin aviso');
    const form = montar();
    agregar(form).click();
    sinPregunta(() => editar(filas(form)[1]));
    assert(abiertos(form).length === 1 && form.montos.length === 2, 'No se agrega nada');
    assert(filas(form).length === 2 && filas(form)[1].contains(abiertos(form)[0]), 'Se abrió el otro');
    form.remove();
}

export const tests = [testCompletoSeAplica, testIncompletoNoAbreOtro, testNuevoVacioSeDescarta];
