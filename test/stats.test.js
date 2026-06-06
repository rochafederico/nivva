// test/stats.test.js
// Tests for StatsCard and StatsIndicators components
import { assert } from './setup.js';
import StatsCard from '../src/features/stats/components/StatsCard.js';
import StatsIndicators from '../src/features/stats/components/StatsIndicators.js';
import { addValue, compactFormat } from '../src/features/stats/utils/formatCurrency.js';
import { summarizeGlobalPayments } from '../src/features/stats/statsService.js';

// ===================================================================
// UC1: StatsCard renders with correct Bootstrap classes
// ===================================================================
async function testStatsCardBootstrapClasses() {
    console.log('  UC1: StatsCard renderiza clases Bootstrap correctas');
    const card = StatsCard({ title: 'Ingresos', items: [{ currency: 'ARS', value: '$ 1.000,00' }], color: 'success' });

    assert(card.classList.contains('card'), 'card debe tener clase "card"');
    assert(card.classList.contains('h-100'), 'card debe tener clase "h-100"');
    assert(card.classList.contains('rounded-4'), 'card debe tener clase "rounded-4"');
    assert(card.classList.contains('shadow-sm'), 'card debe tener clase "shadow-sm"');
    assert(card.classList.contains('border'), 'card debe tener clase "border"');
    assert(card.classList.contains('border-2'), 'card debe tener clase "border-2"');
    assert(card.classList.contains('border-success'), 'card debe tener clase "border-success"');

    const body = card.querySelector('.card-body');
    assert(body !== null, 'card debe renderizar .card-body');
    assert(body.classList.contains('p-3'), 'body debe tener clase "p-3" para padding');

    const titleEl = body.querySelector('div');
    assert(titleEl !== null, 'card-body debe contener un div de título');
    assert(titleEl.classList.contains('fw-semibold'), 'título debe tener clase "fw-semibold"');
    assert(titleEl.classList.contains('text-uppercase'), 'título debe tener clase "text-uppercase"');
    assert(titleEl.classList.contains('text-success'), 'título debe tener clase "text-success"');
    assert(titleEl.textContent === 'Ingresos', 'título debe mostrar el texto correcto');
}

// ===================================================================
// UC2: StatsCard renders items with modern typography classes
// ===================================================================
async function testStatsCardItemClasses() {
    console.log('  UC2: StatsCard renderiza items con clases de tipografía modernas');
    const card = StatsCard({ title: 'Gastos', items: [{ currency: 'ARS', value: '$ 500,00' }, { currency: 'USD', value: '-' }], color: 'danger' });

    const body = card.querySelector('.card-body');
    assert(body !== null, 'card debe renderizar .card-body');

    const arsEl = body.querySelector('h6');
    assert(arsEl !== null, 'card debe renderizar un elemento h6 para ARS');
    assert(arsEl.classList.contains('fw-bold'), 'valor ARS debe tener clase "fw-bold"');
    assert(arsEl.classList.contains('text-danger'), 'valor ARS debe tener clase "text-danger"');
    const arsBadge = arsEl.querySelector('.badge');
    assert(arsBadge !== null, 'valor ARS debe tener un badge con la moneda');
    assert(arsBadge.textContent === 'ARS', 'badge de ARS debe mostrar "ARS"');

    assert(body.querySelector('h5') === null, 'card no debe renderizar ningún elemento h5');
}

// ===================================================================
// UC3: StatsCard renders empty values container when no items
// ===================================================================
async function testStatsCardEmptyItems() {
    console.log('  UC3: StatsCard con lista vacía no muestra valores');
    const card = StatsCard({ title: 'Balance', items: [], color: 'primary' });
    const body = card.querySelector('.card-body');
    assert(body !== null, 'card debe renderizar .card-body incluso sin items');
    assert(body.querySelector('h6') === null, 'card sin items no debe renderizar elemento h6 para ARS');
    assert(body.querySelector('.h5') === null, 'card sin items no debe renderizar ningún elemento de tipografía');
}

// ===================================================================
// UC4: StatsCard uses default color when none is provided
// ===================================================================
async function testStatsCardDefaultColor() {
    console.log('  UC4: StatsCard usa color "secondary" por defecto');
    const card = StatsCard({ title: 'Test' });
    assert(card.classList.contains('border-secondary'), 'card deve tener clase "border-secondary" por defecto');
    const body = card.querySelector('.card-body');
    assert(body !== null, 'card debe renderizar .card-body con color por defecto');
    const titleEl = body.querySelector('div');
    assert(titleEl.classList.contains('text-secondary'), 'título debe tener clase "text-secondary" por defecto');
}

// ===================================================================
// UC5: addValue logic — zero values display as "-" without "$" symbol
// ===================================================================
async function testAddValueZeroDisplaysAsDash() {
    console.log('  UC5: addValue muestra "-" para valores cero sin símbolo $');
    const result = addValue({ ARS: 0, USD: 2500 });
    assert(result[0].currency === 'ARS' && result[0].value === '-', 'valor 0 debe tener currency "ARS" y value "-" sin símbolo $');
    assert(result[1].currency === 'USD' && result[1].value === '2.500', 'valor 2500 debe tener currency "USD" y value "2.500"');
}

// ===================================================================
// UC6: addValue logic — null/undefined values display as "-"
// ===================================================================
async function testAddValueNullDisplaysAsDash() {
    console.log('  UC6: addValue muestra "-" para valores null o undefined');
    const resultNull = addValue({ ARS: null });
    assert(resultNull[0].currency === 'ARS' && resultNull[0].value === '-', 'valor null debe tener value "-"');
    assert(resultNull[1].currency === 'USD' && resultNull[1].value === '-', 'USD ausente debe tener value "-"');

    const resultUndefined = addValue({ USD: undefined });
    assert(resultUndefined[1].currency === 'USD' && resultUndefined[1].value === '-', 'valor undefined debe tener value "-"');

    const resultBoth = addValue({ ARS: null, USD: null });
    assert(resultBoth.every(r => r.value === '-'), 'todos los valores null deben tener value "-"');
}

// ===================================================================
// UC7: addValue always renders both ARS and USD rows
// ===================================================================
async function testAddValueAlwaysShowsBothCurrencies() {
    console.log('  UC7: addValue siempre muestra ARS y USD aunque el objeto esté vacío');

    const resultEmpty = addValue({});
    assert(resultEmpty.length === 2, 'addValue debe retornar siempre 2 filas');
    assert(resultEmpty[0].currency === 'ARS' && resultEmpty[0].value === '-', 'ARS debe tener value "-" cuando no hay datos');
    assert(resultEmpty[1].currency === 'USD' && resultEmpty[1].value === '-', 'USD debe tener value "-" cuando no hay datos');

    const resultNull = addValue(null);
    assert(resultNull.length === 2, 'addValue debe retornar 2 filas cuando obj es null');
    assert(resultNull[0].currency === 'ARS' && resultNull[0].value === '-', 'ARS debe tener value "-" cuando obj es null');
    assert(resultNull[1].currency === 'USD' && resultNull[1].value === '-', 'USD debe tener value "-" cuando obj es null');
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
    console.log('  UC12: StatsIndicators respeta el orden visual de tarjetas');

    const indicators = StatsIndicators({ mes: '2030-01' });
    await new Promise(resolve => setTimeout(resolve, 50));

    const titles = [...indicators.querySelectorAll('.card-body > div:first-child')].map((el) => el.textContent);
    assert(
        JSON.stringify(titles) === JSON.stringify(['Ingresos', 'Gastos', 'Balance', 'Pendientes']),
        'las tarjetas deben renderizar ingresos, gastos, balance y pendientes en ese orden'
    );
}


// ===================================================================
// UC13: summarizeGlobalPayments separates overdue, upcoming, and total
// ===================================================================
async function testSummarizeGlobalPaymentsBucketsAndCounts() {
    console.log('  UC13: summarizeGlobalPayments separa vencidos, próximos y total');

    const summary = summarizeGlobalPayments([
        { monto: 1000, moneda: 'ARS', vencimiento: '2026-01-10', pagado: false },
        { monto: 2000, moneda: 'ARS', vencimiento: '2026-07-10', pagado: false },
        { monto: 50, moneda: 'USD', vencimiento: '2026-08-01', pagado: false },
        { monto: 9999, moneda: 'ARS', vencimiento: '2026-01-01', pagado: true }
    ], '2026-06-06');

    assert(summary.byCurrency.overdue.ARS === 1000, 'vencido debe sumar solo pagos impagos anteriores a hoy');
    assert(summary.byCurrency.upcoming.ARS === 2000, 'próximos debe sumar pagos impagos no vencidos en ARS');
    assert(summary.byCurrency.upcoming.USD === 50, 'próximos debe sumar pagos impagos no vencidos en USD');
    assert(summary.byCurrency.totalDue.ARS === 3000, 'total por pagar debe consolidar vencidos y próximos');
    assert(summary.counts.overdue === 1, 'debe contar 1 vencido');
    assert(summary.counts.upcoming === 2, 'debe contar 2 próximos');
    assert(summary.counts.totalDue === 3, 'debe contar 3 pagos pendientes');
}

// ===================================================================
// UC14: StatsIndicators global summary is opt-in and visually separated
// ===================================================================
async function testStatsIndicatorsGlobalSummaryOptIn() {
    console.log('  UC14: StatsIndicators muestra resumen global solo si showGlobalSummary=true');

    const withoutGlobal = StatsIndicators({ mes: '2030-01' });
    await new Promise(resolve => setTimeout(resolve, 50));
    assert(!withoutGlobal.textContent.includes('Situación total'), 'sin showGlobalSummary no debe mostrar situación total');

    const withGlobal = StatsIndicators({ mes: '2030-01', showGlobalSummary: true });
    await new Promise(resolve => setTimeout(resolve, 50));

    assert(withGlobal.textContent.includes('Situación total'), 'con showGlobalSummary debe mostrar situación total');
    assert(withGlobal.textContent.includes('Resumen global de todos los períodos'), 'copy debe aclarar que incluye todos los períodos');
    assert(withGlobal.textContent.includes('Vencido'), 'resumen global debe priorizar vencido');
    assert(withGlobal.textContent.includes('Próximos a pagar'), 'resumen global debe priorizar próximos a pagar');
    assert(withGlobal.textContent.includes('Total por pagar'), 'resumen global debe mantener total por pagar');

    const globalSection = withGlobal.querySelector('section[aria-labelledby="global-summary-title"]');
    assert(globalSection !== null, 'resumen global debe renderizarse como sección separada');
    assert(globalSection.classList.contains('bg-body-tertiary'), 'resumen global debe tener contenedor visual separado y liviano');

    const totalCard = [...globalSection.querySelectorAll('.card')].find(card => card.textContent.includes('Total por pagar'));
    assert(totalCard !== undefined, 'debe existir la tarjeta Total por pagar');
    assert(totalCard.classList.contains('border-secondary-subtle'), 'Total por pagar debe usar estilo neutro');
    assert(!totalCard.classList.contains('border-success'), 'Total por pagar no debe usar color positivo');
}

export const tests = [
    testStatsCardBootstrapClasses,
    testStatsCardItemClasses,
    testStatsCardEmptyItems,
    testStatsCardDefaultColor,
    testAddValueZeroDisplaysAsDash,
    testAddValueNullDisplaysAsDash,
    testAddValueAlwaysShowsBothCurrencies,
    testCompactFormatMil,
    testCompactFormatMillones,
    testCompactFormatSmall,
    testCompactFormatNull,
    testStatsIndicatorsCardOrder,
    testSummarizeGlobalPaymentsBucketsAndCounts,
    testStatsIndicatorsGlobalSummaryOptIn,
];
