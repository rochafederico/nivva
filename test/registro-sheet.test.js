// Spec 003, criterios 1, 18 y 19: el paso del tipo de egreso y los títulos de gasto con vencimiento.
import { assert } from './setup.js';
import { crearRegistroSheet } from '../src/features/deudas/components/RegistroSheet.js';
import '../src/features/deudas/components/DebtModal.js';

function armar() {
    const elegidos = [];
    const padre = document.body.appendChild(document.createElement('div'));
    const sheet = crearRegistroSheet(padre, (valor) => elegidos.push(valor));
    const opener = document.body.appendChild(document.createElement('button'));
    sheet.abrir(opener);
    const el = sheet._modalEl;
    const textos = () => [...el.querySelectorAll('[data-registro]')].map((b) => `${b.querySelector('.fw-semibold').textContent} ${b.querySelector('small').textContent}`);
    const opcion = (valor) => el.querySelector(`[data-registro="${valor}"]`);
    const fin = () => { sheet.close(); padre.remove(); opener.remove(); };
    return { sheet, el, elegidos, textos, opcion, opener, fin };
}

async function criterio1() {
    console.log('  Criterio 1: Egreso pasa a "¿Qué tipo de egreso?" en la misma ventana');
    const { el, elegidos, textos, opcion, fin } = armar();
    assert(el.querySelector('.modal-dialog').classList.contains('modal-sheet'), 'es un bottom sheet');
    assert(el.querySelector('.modal-title').textContent === '¿Qué querés agregar?', 'primer paso');
    assert(textos()[1] === 'Egreso Súper, tarjeta, préstamo, alquiler', 'detalle nuevo de Egreso');
    assert(textos()[0] === 'Ingreso Sueldo, cobros, reintegros', 'Ingreso no cambia');
    opcion('egreso').click();
    assert(el.classList.contains('show') && elegidos.length === 0, 'la ventana sigue abierta');
    assert(el.querySelector('.modal-title').textContent === '¿Qué tipo de egreso?', 'segundo paso');
    assert(textos().join('|') === 'Gasto Súper, transporte, salidas|Gasto con vencimiento Tarjeta, préstamo, alquiler, servicio', 'ofrece los dos tipos');
    opcion('gasto').click();
    assert(elegidos.join() === 'gasto', 'avisa qué se eligió');
    fin();
}

async function criterio18() {
    console.log('  Criterio 18: el foco queda en Gasto y el grupo lleva el título');
    const { sheet, el, opcion, opener, fin } = armar();
    opcion('egreso').click();
    assert(document.activeElement === opcion('gasto'), 'el foco queda en Gasto');
    const grupo = el.querySelector('[role="group"]');
    assert(grupo.getAttribute('aria-labelledby') === el.querySelector('.modal-title').id, 'el lector anuncia el título');
    assert(opcion('gasto').tagName === 'BUTTON' && opcion('vencimiento').tagName === 'BUTTON', 'Tab, Enter y Espacio con botones nativos');
    sheet.abrir(opener);
    assert(el.querySelector('.modal-title').textContent === '¿Qué querés agregar?', 'al reabrir vuelve al primer paso');
    fin();
}

async function criterio19() {
    console.log('  Criterios 19 y 20: títulos de gasto con vencimiento');
    const modal = document.body.appendChild(document.createElement('debt-modal'));
    await new Promise((r) => setTimeout(r, 0));
    const titulos = [];
    modal.ui.setTitle = (t) => titulos.push(t);
    modal.ui.open = () => {};
    modal.openCreate();
    modal.openEdit({ id: 1, acreedor: 'Banco', tipoDeuda: 'Préstamo', notas: '', montos: [] });
    assert(titulos.join() === 'Agregar gasto con vencimiento,Editar gasto con vencimiento', 'títulos de la spec');
    modal.remove();
}

export const tests = [criterio1, criterio18, criterio19];
