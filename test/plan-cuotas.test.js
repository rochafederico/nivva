// Spec 004, criterios 5 y 8: leer las cuotas, sumarlas y calcular sus vencimientos.
import { assert } from './setup.js';
import { fechasDelPlan, leerCuotas, sumar, textoTotal } from '../src/features/refinanciar/planCuotas.js';

async function criterio5() {
    console.log('  Criterio 5: la coma separa cuotas y el punto, los centavos');
    assert(leerCuotas('5000, 5000, 4800.50').join() === '5000,5000,4800.5', 'lee cada valor en orden');
    assert(leerCuotas(' 5 000 ,1').join() === '5000,1', 'los espacios no importan');
    assert(leerCuotas('5000,50').join() === '5000,50', '5000,50 son dos cuotas');
    ['', '5.000', '0', '-1', '1.234', '5,,6', '5,', 'abc'].forEach((t) => assert(leerCuotas(t) === null, `"${t}" no es válido`));
    assert(leerCuotas(Array(121).fill('1').join()) === null, 'no admite 121');
    assert(sumar([0.1, 0.2]) === 0.3, 'suma sin error de redondeo');
    assert(textoTotal([5000, 5000, 4800.5], 'ARS') === '3 cuotas. Total: $ 14.800,50', 'total');
    assert(textoTotal([5000, 5000, 4800.5], 'ARS', 20000) === '3 cuotas. Total: $ 14.800,50. Adelanto: $ 20.000,00.', 'total con adelanto');
}

async function criterio8() {
    console.log('  Criterio 8: uno por mes, y el último día si el mes no lo tiene');
    assert(fechasDelPlan('2026-12-10', 3).join() === '2026-12-10,2027-01-10,2027-02-10', 'cruza de año');
    assert(fechasDelPlan('2027-01-31', 3).join() === '2027-01-31,2027-02-28,2027-03-31', 'febrero sin 31, marzo vuelve al 31');
}

export const tests = [criterio5, criterio8];
