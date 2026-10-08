// test/stats.test.js
// Tests for StatsCard and StatsIndicators components
import { assert } from './setup.js';
import StatsCard from '../src/features/stats/components/StatsCard.js';
import StatsIndicators, { kpiDetails } from '../src/features/stats/components/StatsIndicators.js';
import { countMonthly } from '../src/features/stats/statsService.js';
import { addValue, compactFormat } from '../src/features/stats/utils/formatCurrency.js';

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
    const card = StatsCard({ title: 'Egresos', items: [{ currency: 'ARS', value: '$ 500,00' }, { currency: 'USD', value: '-' }], color: 'danger' });

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
    console.log('  UC12: StatsIndicators respeta el orden visual de tarjetas');

    const indicators = StatsIndicators({ mes: '2030-01' });
    await new Promise(resolve => setTimeout(resolve, 50));

    const titles = [...indicators.querySelectorAll('.card-body > div:first-child')].map((el) => el.textContent);
    assert(
        JSON.stringify(titles) === JSON.stringify(['Ingresos', 'Egresos', 'Balance', 'Pendientes']),
        'las tarjetas deben renderizar ingresos, gastos, balance y pendientes en ese orden'
    );
}

// ===================================================================
// UC12: StatsCard warning — variantes con contraste AA sobre fondo blanco
// ===================================================================
async function testStatsCardWarningContrast() {
    console.log('  UC12: StatsCard warning usa text-warning-emphasis y badge text-bg-warning');
    const card = StatsCard({ title: 'Pendientes', items: [{ currency: 'ARS', value: '1.000' }], color: 'warning' });
    const titleEl = card.querySelector('.card-body > div');
    assert(titleEl.classList.contains('text-warning-emphasis'), 'título warning debe usar text-warning-emphasis');
    assert(!titleEl.classList.contains('text-warning'), 'título warning no debe usar text-warning (contraste insuficiente)');
    const valueEl = card.querySelector('h6');
    assert(valueEl.classList.contains('text-warning-emphasis'), 'valor warning debe usar text-warning-emphasis');
    const badge = valueEl.querySelector('.badge');
    assert(badge.classList.contains('text-bg-warning'), 'badge warning debe usar text-bg-warning (texto oscuro)');
}

// ===================================================================
// UC13: StatsCard — el monto no se corta y la moneda puede pasar de renglón
// ===================================================================
async function testStatsCardValueWraps() {
    console.log('  UC13: StatsCard permite que la moneda pase de renglón sin cortar el monto');
    const card = StatsCard({ title: 'Ingresos', items: [{ currency: 'ARS', value: '3.939.584,91' }], color: 'success' });
    const valueEl = card.querySelector('h6');
    assert(valueEl.classList.contains('flex-wrap'), 'el contenedor del valor debe permitir wrap');
    assert(!valueEl.classList.contains('text-nowrap'), 'el contenedor del valor no debe forzar una sola línea');
    const amount = valueEl.querySelector('span.text-nowrap');
    assert(amount !== null && amount.textContent === '3.939.584,91', 'el monto debe ir en un span text-nowrap');
    assert(valueEl.querySelector('.badge').classList.contains('text-bg-success'), 'badge debe usar text-bg-{color}');
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
// UC15: kpiDetails — textos de detalle de cada tarjeta
// ===================================================================
async function testKpiDetails() {
    console.log('  UC15: kpiDetails arma los textos de detalle (plural, vencidos, todo pagado)');
    const d = kpiDetails({ ingresos: 1, montos: 4, pagados: 2, pendientes: 2, vencidos: 1 });
    assert(d.ingresos.text === '1 ingreso', 'singular de ingresos');
    assert(d.egresos.text === '2 de 4 pagados', 'egresos muestra pagados sobre total');
    assert(d.pendientes.text === '1 vencido' && d.pendientes.className.includes('text-danger-emphasis'), 'vencidos se destacan en rojo');
    const sinVencidos = kpiDetails({ ingresos: 2, montos: 3, pagados: 1, pendientes: 2, vencidos: 0 });
    assert(sinVencidos.ingresos.text === '2 ingresos', 'plural de ingresos');
    assert(sinVencidos.pendientes.text === '2 por pagar', 'sin vencidos muestra cuántos quedan por pagar');
    const vacio = kpiDetails({});
    assert(vacio.ingresos.text === 'Sin ingresos' && vacio.egresos.text === 'Sin egresos' && vacio.pendientes.text === 'Todo pagado',
        'sin datos muestra textos de estado vacío');
}

// ===================================================================
// UC16: StatsCard — detalle y tarjeta clickeable con stretched-link
// ===================================================================
async function testStatsCardDetailAndLink() {
    console.log('  UC16: StatsCard muestra el detalle y, con href, toda la tarjeta es un link');
    const card = StatsCard({
        title: 'Egresos', items: [{ currency: 'ARS', value: '1.000' }], color: 'danger',
        detail: { text: '2 de 4 pagados' }, href: '/gastos'
    });
    assert(card.querySelector('.kpi-detail')?.textContent === '2 de 4 pagados', 'debe mostrar el texto de detalle');
    const link = card.querySelector('a.stretched-link');
    assert(link !== null && link.getAttribute('href') === '/gastos', 'el título debe ser un stretched-link al listado');
    assert(link.textContent === 'Egresos', 'el nombre del link es el título visible');
    assert(card.classList.contains('position-relative') && card.classList.contains('kpi-card-link'), 'la tarjeta contiene al stretched-link');

    const plain = StatsCard({ title: 'Balance', items: [{ currency: 'ARS', value: '0' }], color: 'primary' });
    assert(plain.querySelector('a') === null, 'sin href la tarjeta no es un link');
    assert(plain.querySelector('.kpi-detail') === null, 'sin detalle no agrega la línea');
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
    testStatsCardBootstrapClasses,
    testCountMonthly,
    testKpiDetails,
    testStatsCardDetailAndLink,
    testStatsIndicatorsLinksNavigate,
    testStatsCardWarningContrast,
    testStatsCardValueWraps,
    testStatsCardItemClasses,
    testStatsCardEmptyItems,
    testStatsCardDefaultColor,
    testAddValueZeroDisplaysAsZero,
    testAddValueNullDisplaysAsZero,
    testAddValueAlwaysShowsBothCurrencies,
    testCompactFormatMil,
    testCompactFormatMillones,
    testCompactFormatSmall,
    testCompactFormatNull,
    testStatsIndicatorsCardOrder,
];
