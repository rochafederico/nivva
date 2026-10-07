// test/stats.test.js
// Tests del resumen del mes (StatsIndicators), statsService y formato de montos
import { assert, waitFor } from './setup.js';
import StatsIndicators, { KPI_ITEMS } from '../src/features/stats/components/StatsIndicators.js';
import { countMonthly } from '../src/features/stats/statsService.js';
import { addValue, compactFormat } from '../src/features/stats/utils/formatCurrency.js';

// ===================================================================
// UC5: addValue logic — zero values display as "0" without "$" symbol
// ===================================================================
async function testAddValueZeroDisplaysAsZero() {
    console.log('  UC5: addValue muestra "0" para valores cero sin símbolo $');
    const result = addValue({ ARS: 0, USD: 2500 });
    assert(result[0].currency === 'ARS' && result[0].value === '0', 'valor 0 debe tener currency "ARS" y value "0" sin símbolo $');
    assert(result[1].currency === 'USD' && result[1].value === '2.500', 'valor 2500 debe tener currency "USD" y value "2.500"');
}

// ===================================================================
// UC6: addValue logic — null/undefined values display as "0"
// ===================================================================
async function testAddValueNullDisplaysAsZero() {
    console.log('  UC6: addValue muestra "0" para valores null o undefined');
    const resultNull = addValue({ ARS: null });
    assert(resultNull[0].currency === 'ARS' && resultNull[0].value === '0', 'valor null debe tener value "0"');
    assert(resultNull[1].currency === 'USD' && resultNull[1].value === '0', 'USD ausente debe tener value "0"');

    const resultUndefined = addValue({ USD: undefined });
    assert(resultUndefined[1].currency === 'USD' && resultUndefined[1].value === '0', 'valor undefined debe tener value "0"');

    const resultBoth = addValue({ ARS: null, USD: null });
    assert(resultBoth.every(r => r.value === '0'), 'todos los valores null deben tener value "0"');

    const negative = addValue({ ARS: -1500.5 });
    assert(negative[0].value === '-1.500,5', 'un balance negativo debe conservar el signo');
}

// ===================================================================
// UC7: addValue always renders both ARS and USD rows
// ===================================================================
async function testAddValueAlwaysShowsBothCurrencies() {
    console.log('  UC7: addValue siempre muestra ARS y USD aunque el objeto esté vacío');

    const resultEmpty = addValue({});
    assert(resultEmpty.length === 2, 'addValue debe retornar siempre 2 filas');
    assert(resultEmpty[0].currency === 'ARS' && resultEmpty[0].value === '0', 'ARS debe tener value "0" cuando no hay datos');
    assert(resultEmpty[1].currency === 'USD' && resultEmpty[1].value === '0', 'USD debe tener value "0" cuando no hay datos');

    const resultNull = addValue(null);
    assert(resultNull.length === 2, 'addValue debe retornar 2 filas cuando obj es null');
    assert(resultNull[0].currency === 'ARS' && resultNull[0].value === '0', 'ARS debe tener value "0" cuando obj es null');
    assert(resultNull[1].currency === 'USD' && resultNull[1].value === '0', 'USD debe tener value "0" cuando obj es null');
}

// ===================================================================
// UC8: compactFormat — full es-AR numeric format for large values
// ===================================================================
async function testCompactFormatMil() {
    console.log('  UC8: compactFormat muestra formato numérico completo para valores >= 1.000');
    assert(compactFormat(850000) === '850.000', '850000 debe mostrarse como "850.000"');
    assert(compactFormat(1000) === '1.000', '1000 debe mostrarse como "1.000"');
    assert(compactFormat(1200) === '1.200', '1200 debe mostrarse como "1.200"');
    assert(compactFormat(500000) === '500.000', '500000 debe mostrarse como "500.000"');
}

// ===================================================================
// UC9: compactFormat — full es-AR numeric format for million values
// ===================================================================
async function testCompactFormatMillones() {
    console.log('  UC9: compactFormat muestra formato numérico completo para valores >= 1.000.000');
    assert(compactFormat(1200000) === '1.200.000', '1200000 debe mostrarse como "1.200.000"');
    assert(compactFormat(3450000) === '3.450.000', '3450000 debe mostrarse como "3.450.000"');
    assert(compactFormat(1000000) === '1.000.000', '1000000 debe mostrarse como "1.000.000"');
}

// ===================================================================
// UC10: compactFormat — small values use es-AR format without decimals
// ===================================================================
async function testCompactFormatSmall() {
    console.log('  UC10: compactFormat usa formato es-AR para valores < 1.000');
    assert(compactFormat(500) === '500', '500 debe mostrarse como "500"');
    assert(compactFormat(999) === '999', '999 debe mostrarse como "999"');
    assert(compactFormat(0) === '0', '0 debe mostrarse como "0"');
}

// ===================================================================
// UC11: compactFormat — null/undefined returns "-"
// ===================================================================
async function testCompactFormatNull() {
    console.log('  UC11: compactFormat muestra "-" para null o undefined');
    assert(compactFormat(null) === '-', 'null debe retornar "-"');
    assert(compactFormat(undefined) === '-', 'undefined debe retornar "-"');
}

// ===================================================================
// UC12: StatsIndicators renders cards in the configured visual order
// ===================================================================
async function testStatsIndicatorsCardOrder() {
    console.log('  UC12: StatsIndicators muestra un único banner con Ingresos, Egresos, Balance y Por pagar este mes');

    const indicators = StatsIndicators({ mes: '2030-01' });
    document.body.appendChild(indicators);
    await waitFor(() => indicators.querySelector('.kpi-banner'));

    assert(indicators.querySelectorAll('.card').length === 1, 'debe ser un solo banner compacto, no cuatro tarjetas');
    const labels = [...indicators.querySelectorAll('.kpi-label')].map((el) => el.textContent);
    assert(
        JSON.stringify(labels) === JSON.stringify(['Ingresos', 'Egresos', 'Balance', 'Por pagar este mes']),
        'el banner debe mostrar ingresos, egresos, balance y por pagar este mes en ese orden'
    );
    assert(!indicators.textContent.includes('Pendientes'), 'ya no se usa "Pendientes" (se confundía con la deuda total)');
    assert(JSON.stringify(KPI_ITEMS.map(i => i.label)) === JSON.stringify(labels), 'KPI_ITEMS define los textos del banner');
    const amounts = [...indicators.querySelectorAll('.kpi-amount')].map((el) => el.textContent);
    assert(amounts.every(a => a === '$ 0,00'), 'un mes sin datos muestra $ 0,00 en cada dato');
    assert(indicators.querySelector('.kpi-alert') === null, 'sin vencidos no hay alerta');
    indicators.remove();
}

// ===================================================================
// UC14: countMonthly — cantidades del mes para los textos de detalle
// ===================================================================
async function testCountMonthly() {
    console.log('  UC14: countMonthly cuenta pagados, pendientes y vencidos (impagos con fecha pasada)');
    const montos = [
        { pagado: true, vencimiento: '2026-10-01' },
        { pagado: false, vencimiento: '2026-10-05' },
        { pagado: false, vencimiento: '2026-10-15' },
        { pagado: false, vencimiento: '2026-10-20' },
        { pagado: false, vencimiento: '' },
    ];
    const counts = countMonthly(montos, 3, '2026-10-15');
    assert(counts.ingresos === 3, 'debe informar la cantidad de ingresos');
    assert(counts.montos === 5 && counts.pagados === 1 && counts.pendientes === 4, 'debe contar montos, pagados y pendientes');
    assert(counts.vencidos === 1, 'solo vence un impago con fecha anterior a hoy (hoy no está vencido)');
    const empty = countMonthly();
    assert(empty.montos === 0 && empty.vencidos === 0 && empty.ingresos === 0, 'sin datos todo en 0');
}

// ===================================================================
// UC17: StatsIndicators — tocar una tarjeta navega sin recargar
// ===================================================================
async function testStatsIndicatorsLinksNavigate() {
    console.log('  UC17: StatsIndicators navega (pushState) al tocar una tarjeta con link');
    const previous = window.location.pathname;
    window.history.pushState({}, '', '/');
    const indicators = StatsIndicators({ mes: '2030-01', links: { ingresos: '/ingresos', egresos: '/gastos' } });
    document.body.appendChild(indicators);
    await new Promise(resolve => setTimeout(resolve, 50));

    const links = [...indicators.querySelectorAll('a.stretched-link')].map(a => a.getAttribute('href'));
    assert(JSON.stringify(links) === JSON.stringify(['/ingresos', '/gastos']), 'solo las tarjetas con destino son links');

    let popstates = 0;
    const onPop = () => { popstates++; };
    window.addEventListener('popstate', onPop);
    indicators.querySelector('a[href="/gastos"]').dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
    window.removeEventListener('popstate', onPop);
    assert(window.location.pathname === '/gastos', 'debe navegar al listado de egresos');
    assert(popstates === 1, 'debe avisar al router con popstate');

    indicators.remove();
    window.history.pushState({}, '', previous);
}

export const tests = [
    testCountMonthly,
    testStatsIndicatorsLinksNavigate,
    testAddValueZeroDisplaysAsZero,
    testAddValueNullDisplaysAsZero,
    testAddValueAlwaysShowsBothCurrencies,
    testCompactFormatMil,
    testCompactFormatMillones,
    testCompactFormatSmall,
    testCompactFormatNull,
    testStatsIndicatorsCardOrder,
];
