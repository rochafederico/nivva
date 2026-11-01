// test/montos-formato.test.js
// Spec 001 · T01: forma hablada del monto y la fecha, y cálculo del monto duplicado.
import { assert } from './setup.js';
import { montoHablado, fechaHablada } from '../src/features/montos/utils/montoHablado.js';
import { duplicarMonto, vencimientoDuplicado } from '../src/features/montos/utils/duplicarMonto.js';

// Criterio 3 y forma hablada: cifra sin miles, centavos con dos decimales y coma.
function testMontoHablado() {
    console.log('  Spec 001 C3: monto en la forma hablada');
    assert(montoHablado(15000, 'ARS') === '15000 pesos', '15000 pesos');
    assert(montoHablado(15000.5, 'ARS') === '15000,50 pesos', '15000,50 pesos');
    assert(montoHablado(1, 'ARS') === '1 peso', '1 peso en singular');
    assert(montoHablado(1, 'USD') === '1 dólar', '1 dólar en singular');
    assert(montoHablado(1200, 'USD') === '1200 dólares', '1200 dólares');
    assert(montoHablado(1.5, 'ARS') === '1,50 pesos', '1,50 en plural');
    assert(montoHablado(0.5, 'USD') === '0,50 dólares', '0,50 dólares');
    assert(montoHablado(2, 'ARS') === '2 pesos', '2 pesos');
    assert(montoHablado('15000', 'ARS') === '15000 pesos', 'Acepta la cifra como texto');
}

function testFechaHablada() {
    console.log('  Spec 001 C3: fecha en la forma hablada');
    assert(fechaHablada('2026-11-10') === '10 de noviembre de 2026', '10 de noviembre de 2026');
    assert(fechaHablada('2027-01-01') === '1 de enero de 2027', 'Día sin cero adelante');
}

// Criterio 6: mismo día que el duplicado, en el mes siguiente al último vencimiento.
function testDuplicarMesSiguiente() {
    console.log('  Spec 001 C6: el duplicado vence en el mes siguiente al último');
    const montos = [
        { id: 7, monto: 15000, moneda: 'ARS', vencimiento: '2026-11-10', periodo: '2026-11', pagado: true },
        { id: 8, monto: 15000, moneda: 'ARS', vencimiento: '2026-12-05', periodo: '2026-12', pagado: false }
    ];
    const nuevo = duplicarMonto(montos[0], montos);
    assert(nuevo.vencimiento === '2027-01-10', 'Vence el 10/01/2027');
    assert(nuevo.monto === 15000 && nuevo.moneda === 'ARS', 'Misma cifra y moneda');
    assert(nuevo.pagado === false, 'Sin marcar como pagado');
    assert(!('id' in nuevo), 'Sin id: es un monto nuevo');
    assert(!('periodo' in nuevo), 'Sin período: corresponde al mes de su vencimiento');
    assert(montos[0].vencimiento === '2026-11-10' && montos.length === 2, 'No cambia la lista ni el original');
}

// Criterio 7: si el mes siguiente tiene menos días, vence el último día.
function testDuplicarFinDeMes() {
    console.log('  Spec 001 C7: día 31 con mes siguiente más corto');
    const enero = [{ vencimiento: '2027-01-31' }];
    assert(vencimientoDuplicado('2027-01-31', enero) === '2027-02-28', 'Vence el 28/02/2027');
    const bisiesto = [{ vencimiento: '2028-01-31' }];
    assert(vencimientoDuplicado('2028-01-31', bisiesto) === '2028-02-29', 'Bisiesto: 29/02/2028');
    const marzo = [{ vencimiento: '2027-03-31' }];
    assert(vencimientoDuplicado('2027-03-31', marzo) === '2027-04-30', 'Abril: 30/04/2027');
}

export const tests = [testMontoHablado, testFechaHablada, testDuplicarMesSiguiente, testDuplicarFinDeMes];
