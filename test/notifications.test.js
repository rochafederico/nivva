// test/notifications.test.js
// Tests for HU 2.1: NotificationService – upcoming payment notifications
import { assert } from './setup.js';
import {
    getUpcomingPayments,
    isNotificationSupported,
    getStoredPermission,
    setStoredPermission,
    requestPermission,
    checkAndNotify,
    showInAppNotification,
    showGroupedInAppNotification,
    formatDate,
    formatRelativeDate,
    buildUpcomingPaymentsHTML,
    showInAppPanel
} from '../src/features/notifications/NotificationService.js';
import { createNavbarPopover } from '../src/layout/navbarPopoversController.js';
import { createDropdown, createPopover, destroyDropdown, destroyPopover } from '../src/shared/ui/bootstrap/index.js';

function localDate(year, month, day) {
    return new Date(year, month - 1, day, 12, 0, 0);
}

// ===================================================================
// UC1: getUpcomingPayments – filters payments due in the next 3 days and overdue in current month
// ===================================================================
async function testGetUpcomingPayments() {
    console.log('  UC1: getUpcomingPayments returns upcoming payments plus overdue payments in the current month');

    const now = localDate(2026, 4, 3);

    const deudas = [
        {
            acreedor: 'Banco A',
            cuotas: [
                { cuota: 1000, moneda: 'ARS', vencimiento: '2026-04-03', pagado: false }, // today
                { cuota: 2000, moneda: 'ARS', vencimiento: '2026-04-05', pagado: false }, // 2 days ahead
                { cuota: 3000, moneda: 'ARS', vencimiento: '2026-04-06', pagado: false }, // 3 days ahead (limit)
                { cuota: 4000, moneda: 'ARS', vencimiento: '2026-04-07', pagado: false }, // 4 days ahead (out)
                { cuota: 5000, moneda: 'ARS', vencimiento: '2026-04-03', pagado: true },  // paid (excluded)
                { cuota: 6000, moneda: 'ARS', vencimiento: '2026-04-02', pagado: false }, // overdue this month (included)
                { cuota: 7000, moneda: 'ARS', vencimiento: '2026-03-31', pagado: false }, // past previous month (excluded)
            ]
        },
        {
            acreedor: 'Banco B',
            cuotas: [
                { cuota: 100, moneda: 'USD', vencimiento: '2026-04-04', pagado: false } // 1 day ahead
            ]
        }
    ];

    const upcoming = getUpcomingPayments(deudas, 3, now);

    assert(upcoming.length === 5, `Debe haber 5 pagos a considerar, encontrados: ${upcoming.length}`);
    assert(upcoming.some(p => p.cuota === 1000), 'Incluye pago de hoy');
    assert(upcoming.some(p => p.cuota === 2000), 'Incluye pago en 2 días');
    assert(upcoming.some(p => p.cuota === 3000), 'Incluye pago en 3 días (límite)');
    assert(upcoming.some(p => p.cuota === 100 && p.moneda === 'USD'), 'Incluye pago USD');
    assert(upcoming.some(p => p.cuota === 6000), 'Incluye pago vencido del mes actual');
    assert(!upcoming.some(p => p.cuota === 4000), 'Excluye pago fuera de rango');
    assert(!upcoming.some(p => p.cuota === 5000), 'Excluye pago ya pagado');
    assert(!upcoming.some(p => p.cuota === 7000), 'Excluye pago vencido de otro mes');
}

// ===================================================================
// UC2: getUpcomingPayments – correct data shape in results
// ===================================================================
async function testGetUpcomingPaymentsShape() {
    console.log('  UC2: getUpcomingPayments returns correct data shape');

    const now = localDate(2026, 4, 3);
    const deudas = [{
        id: 42,
        acreedor: 'Visa',
        cuotas: [{ cuota: 500, moneda: 'USD', vencimiento: '2026-04-04', pagado: false }]
    }];

    const upcoming = getUpcomingPayments(deudas, 3, now);
    assert(upcoming.length === 1, 'Debe haber 1 pago');

    const p = upcoming[0];
    assert(p.deudaId === 42, 'deudaId correcto');
    assert(p.acreedor === 'Visa', 'acreedor correcto');
    assert(p.cuota === 500, 'cuota correcto');
    assert(p.moneda === 'USD', 'moneda correcta');
    assert(p.vencimiento === '2026-04-04', 'vencimiento correcto');
}

// ===================================================================
// UC3: getUpcomingPayments – empty deudas
// ===================================================================
async function testGetUpcomingPaymentsEmpty() {
    console.log('  UC3: getUpcomingPayments returns empty array for no deudas');

    const now = localDate(2026, 4, 3);
    const upcoming = getUpcomingPayments([], 3, now);
    assert(upcoming.length === 0, 'Sin deudas: lista vacía');
}

// ===================================================================
// UC4: localStorage permission management
// ===================================================================
async function testStoredPermission() {
    console.log('  UC4: getStoredPermission / setStoredPermission use localStorage');

    localStorage.removeItem('nivva_notifications_permission');
    assert(getStoredPermission() === null, 'Permiso no establecido: null');

    setStoredPermission('granted');
    assert(getStoredPermission() === 'granted', 'Permiso guardado: granted');

    setStoredPermission('denied');
    assert(getStoredPermission() === 'denied', 'Permiso guardado: denied');

    // Cleanup
    localStorage.removeItem('nivva_notifications_permission');
}

// ===================================================================
// UC5: requestPermission – skips browser prompt when stored as denied
// ===================================================================
async function testRequestPermissionDeniedSkipsPrompt() {
    console.log('  UC5: requestPermission does not prompt when stored permission is denied');

    localStorage.setItem('nivva_notifications_permission', 'denied');

    let promptCalled = false;
    const originalNotification = global.Notification;

    // Mock Notification with permission=default so the only block that fires is the stored check
    global.Notification = class {
        static get permission() { return 'default'; }
        static requestPermission() {
            promptCalled = true;
            return Promise.resolve('granted');
        }
    };

    const result = await requestPermission();

    assert(result === 'denied', 'Debe retornar denied sin preguntar');
    assert(!promptCalled, 'No debe llamar a requestPermission del navegador');

    // Restore
    global.Notification = originalNotification;
    localStorage.removeItem('nivva_notifications_permission');
}

// ===================================================================
// UC6: checkAndNotify – sends notifications for upcoming payments
// ===================================================================
async function testCheckAndNotifySendsNotifications() {
    console.log('  UC6: checkAndNotify sends notifications when permission granted');

    const now = localDate(2026, 4, 3);
    const notificationsSent = [];

    const originalNotification = global.Notification;

    // Mock Notification API as granted
    global.Notification = class {
        static get permission() { return 'granted'; }
        static requestPermission() { return Promise.resolve('granted'); }
        constructor(title, opts) {
            notificationsSent.push({ title, body: opts?.body });
        }
    };

    localStorage.setItem('nivva_notifications_permission', 'granted');

    const deudas = [{
        acreedor: 'MiCredito',
        cuotas: [
            { cuota: 800, moneda: 'ARS', vencimiento: '2026-04-04', pagado: false },
            { cuota: 999, moneda: 'USD', vencimiento: '2026-04-07', pagado: false } // out of range
        ]
    }];

    // Use getUpcomingPayments + sendPaymentNotification directly (avoids async permission)
    const { getUpcomingPayments: gup, sendPaymentNotification: spn } = await import('../src/features/notifications/NotificationService.js');
    const upcoming = gup(deudas, 3, now);
    upcoming.forEach(p => spn(p, now));

    assert(notificationsSent.length === 1, `Debe enviar 1 notificación, enviadas: ${notificationsSent.length}`);
    assert(notificationsSent[0].title.includes('MiCredito'), 'Título incluye acreedor');
    assert(notificationsSent[0].body.includes('ARS'), 'Cuerpo incluye moneda');
    assert(notificationsSent[0].body.includes('04/04/2026'), 'Cuerpo incluye fecha en formato DD/MM/YYYY');

    // Restore
    global.Notification = originalNotification;
    localStorage.removeItem('nivva_notifications_permission');
}

// ===================================================================
// UC6b: sendPaymentNotification – overdue payments use pending wording
// ===================================================================
async function testCheckAndNotifySendsOverdueNotifications() {
    console.log('  UC6b: sendPaymentNotification uses overdue wording when payment is already vencido');

    const now = localDate(2026, 4, 3);
    const notificationsSent = [];

    const originalNotification = global.Notification;

    global.Notification = class {
        static get permission() { return 'granted'; }
        static requestPermission() { return Promise.resolve('granted'); }
        constructor(title, opts) {
            notificationsSent.push({ title, body: opts?.body });
        }
    };

    const { sendPaymentNotification: spn } = await import('../src/features/notifications/NotificationService.js');
    spn({ acreedor: 'MiCredito', cuota: 800, moneda: 'ARS', vencimiento: '2026-04-02' }, now);

    assert(notificationsSent.length === 1, 'Debe enviar 1 notificación vencida');
    assert(notificationsSent[0].title === '⚠️ Vencimiento pendiente: MiCredito', 'Título vencido correcto');
    assert(notificationsSent[0].body.includes('Venció ayer'), 'Cuerpo usa copy de pago vencido');

    global.Notification = originalNotification;
}

// ===================================================================
// UC7: checkAndNotify – always shows panel but skips native notifications when Notification not supported
// ===================================================================
async function testCheckAndNotifyUnsupported() {
    console.log('  UC7: checkAndNotify always shows panel; skips native notifications when API is not supported');

    const originalNotification = global.Notification;
    delete global.Notification;

    assert(!isNotificationSupported(), 'isNotificationSupported debe ser false');

    const events = [];
    const handler = (e) => events.push(e.detail);
    window.addEventListener('app:upcoming-panel', handler);

    // Should not throw
    let threw = false;
    try {
        await checkAndNotify([]);
    } catch {
        threw = true;
    }
    assert(!threw, 'checkAndNotify no debe lanzar error cuando API no está soportada');
    assert(events.length === 1, 'Siempre se despacha el evento app:upcoming-panel para inicializar el popover');
    assert(events[0].html.includes('No hay vencimientos próximos'), 'El panel muestra el estado vacío');

    window.removeEventListener('app:upcoming-panel', handler);
    global.Notification = originalNotification;
}

// ===================================================================
// UC8: showInAppNotification – dispatches app:notify event as warning
// ===================================================================
async function testShowInAppNotification() {
    console.log('  UC8: showInAppNotification dispatches an app:notify warning event with new visual format');

    const events = [];
    const handler = (e) => events.push(e.detail);
    window.addEventListener('app:notify', handler);

    // Pass a fixed `now` so the relative-date label is deterministic
    showInAppNotification(
        { acreedor: 'Pago Test', cuota: 999, moneda: 'ARS', vencimiento: '2026-04-05' },
        localDate(2026, 4, 4)
    );

    assert(events.length === 1, 'Debe despachar 1 evento app:notify');
    assert(events[0].type === 'warning', 'El tipo de toast es warning');
    assert(events[0].message.includes('Pago Test'), 'El mensaje incluye el acreedor');
    assert(events[0].message.includes('ARS'), 'El mensaje incluye la moneda');
    assert(events[0].message.includes('05/04/2026'), 'El mensaje incluye la fecha en formato DD/MM/YYYY');
    assert(events[0].message.includes('mañana'), 'El mensaje incluye la etiqueta relativa de fecha');
    assert(events[0].message.includes('Ver detalle'), 'El mensaje incluye la acción Ver detalle');

    window.removeEventListener('app:notify', handler);
}

// ===================================================================
// UC8b: showInAppNotification – overdue payments use pending wording
// ===================================================================
async function testShowInAppNotificationOverdue() {
    console.log('  UC8b: showInAppNotification uses overdue wording for payments already vencidos');

    const events = [];
    const handler = (e) => events.push(e.detail);
    window.addEventListener('app:notify', handler);

    showInAppNotification(
        { acreedor: 'Pago Vencido', cuota: 999, moneda: 'ARS', vencimiento: '2026-04-02' },
        localDate(2026, 4, 3)
    );

    assert(events.length === 1, 'Debe despachar 1 evento app:notify');
    assert(events[0].message.includes('Vencimiento pendiente'), 'El mensaje usa título de vencimiento pendiente');
    assert(events[0].message.includes('Venció ayer'), 'El mensaje usa copy de pago vencido');

    window.removeEventListener('app:notify', handler);
}

// ===================================================================
// UC9: checkAndNotify – sends grouped native notification when >5 payments
// ===================================================================
async function testCheckAndNotifyGroupedNative() {
    console.log('  UC9: checkAndNotify sends one grouped notification when more than 5 payments');

    const notificationsSent = [];

    const originalNotification = global.Notification;

    global.Notification = class {
        static get permission() { return 'granted'; }
        static requestPermission() { return Promise.resolve('granted'); }
        constructor(title, opts) {
            notificationsSent.push({ title, body: opts?.body });
        }
    };

    localStorage.setItem('nivva_notifications_permission', 'granted');

    // Use getUpcomingPayments + sendGroupedNotification directly with a fixed date
    const { getUpcomingPayments: gup, sendGroupedNotification: sgn } = await import('../src/features/notifications/NotificationService.js');
    const now = localDate(2026, 4, 3);
    const cuotas = Array.from({ length: 6 }, (_, i) => ({
        cuota: (i + 1) * 100,
        moneda: 'ARS',
        vencimiento: '2026-04-04',
        pagado: false
    }));
    const deudas = [{ acreedor: 'Banco Test', cuotas }];
    const upcoming = gup(deudas, 3, now);

    assert(upcoming.length === 6, `Deben haber 6 pagos pendientes, encontrados: ${upcoming.length}`);
    sgn(upcoming.length);

    assert(notificationsSent.length === 1, `Debe enviar 1 notificación agrupada, enviadas: ${notificationsSent.length}`);
    assert(notificationsSent[0].title === 'Pagos vencidos o por vencer', 'Título de notificación agrupada correcto');
    assert(notificationsSent[0].body.includes('6'), 'Cuerpo incluye la cantidad de pagos');
    assert(notificationsSent[0].body.includes('vencidos o por vencer'), 'Cuerpo usa copy consistente con pagos vencidos');

    global.Notification = originalNotification;
    localStorage.removeItem('nivva_notifications_permission');
}

// ===================================================================
// UC10: showGroupedInAppNotification – dispatches app:notify with count and link
// ===================================================================
async function testShowGroupedInAppNotification() {
    console.log('  UC10: showGroupedInAppNotification dispatches a grouped app:notify warning with count and link');

    const events = [];
    const handler = (e) => events.push(e.detail);
    window.addEventListener('app:notify', handler);

    showGroupedInAppNotification(6);

    assert(events.length === 1, 'Debe despachar 1 evento app:notify');
    assert(events[0].type === 'warning', 'El tipo de toast es warning');
    assert(events[0].message.includes('6'), 'El mensaje incluye la cantidad de pagos');
    assert(events[0].message.includes('vencidos o por vencer'), 'El mensaje usa copy consistente con pagos vencidos');
    assert(events[0].message.includes('href="/"'), 'El mensaje incluye un enlace al detalle');

    window.removeEventListener('app:notify', handler);
}

// ===================================================================
// UC11: formatDate y formatRelativeDate – date formatting helpers
// ===================================================================
async function testFormatHelpers() {
    console.log('  UC11: formatDate y formatRelativeDate formatean fechas correctamente');

    // formatDate
    assert(formatDate('2026-04-05') === '05/04/2026', 'formatDate: YYYY-MM-DD → DD/MM/YYYY');
    assert(formatDate('2026-01-01') === '01/01/2026', 'formatDate: maneja mes y día con ceros');

    // formatRelativeDate
    const now = localDate(2026, 4, 3);
    assert(formatRelativeDate('2026-04-03', now) === 'hoy', 'formatRelativeDate: misma fecha → hoy');
    assert(formatRelativeDate('2026-04-04', now) === 'mañana', 'formatRelativeDate: día siguiente → mañana');
    assert(formatRelativeDate('2026-04-06', now) === 'en 3 días', 'formatRelativeDate: 3 días después');
    assert(formatRelativeDate('2026-04-02', now) === 'ayer', 'formatRelativeDate: día previo → ayer');
    assert(formatRelativeDate('2026-04-01', now) === 'hace 2 días', 'formatRelativeDate: días previos del mes');
}

// ===================================================================
// UC12: buildUpcomingPaymentsHTML – groups by overdue/today/tomorrow/rest, truncates rest>5
// ===================================================================
async function testBuildUpcomingPaymentsHTML() {
    console.log('  UC12: buildUpcomingPaymentsHTML groups overdue and upcoming payments and truncates rest list');

    const now = localDate(2026, 4, 3);

    const payments = [
        { acreedor: 'Cable',    cuota: 1500,   moneda: 'ARS', vencimiento: '2026-04-02' }, // overdue
        { acreedor: 'Patente',  cuota: 2100,   moneda: 'ARS', vencimiento: '2026-03-31' }, // old overdue (excluded)
        { acreedor: 'NaranjaX', cuota: 212776, moneda: 'ARS', vencimiento: '2026-04-03' }, // today
        { acreedor: 'Brubank',  cuota: 212776, moneda: 'ARS', vencimiento: '2026-04-03' }, // today
        { acreedor: 'Juli',     cuota: 598646, moneda: 'ARS', vencimiento: '2026-04-04' }, // tomorrow
        { acreedor: 'Personal', cuota: 1000,   moneda: 'ARS', vencimiento: '2026-04-05' }, // rest
        { acreedor: 'Edenor',   cuota: 1000,   moneda: 'ARS', vencimiento: '2026-04-05' }, // rest
        { acreedor: 'Netflix',  cuota: 1000,   moneda: 'ARS', vencimiento: '2026-04-05' }, // rest
        { acreedor: 'San Lorenzo', cuota: 1000, moneda: 'ARS', vencimiento: '2026-04-06' }, // rest
        { acreedor: 'Expensas', cuota: 1000,   moneda: 'ARS', vencimiento: '2026-04-06' }, // rest
        { acreedor: 'MercadoPago', cuota: 1000, moneda: 'ARS', vencimiento: '2026-04-06' }, // rest (6th → truncated)
    ];

    const { html, todayCount, overdueCount } = buildUpcomingPaymentsHTML(payments, now);

    assert(html.includes('Vencidos del mes'), 'Incluye sección Vencidos del mes');
    assert(html.includes('Cable'), 'Incluye pagos vencidos del mes actual');
    assert(!html.includes('Patente'), 'No incluye pagos vencidos de meses anteriores');

    // Today section
    assert(html.includes('Hoy'), 'Incluye sección Hoy');
    assert(html.includes('NaranjaX'), 'Incluye NaranjaX en Hoy');
    assert(html.includes('Brubank'), 'Incluye Brubank en Hoy');

    // Tomorrow section
    assert(html.includes('Mañana'), 'Incluye sección Mañana');
    assert(html.includes('Juli'), 'Incluye Juli en Mañana');

    // Rest section – 6 items, max 5 shown, "y 1 más"
    assert(html.includes('Próximos días'), 'Incluye sección Próximos días');
    assert(html.includes('Personal'), 'Lista rest incluye Personal');
    assert(html.includes('y 1 más'), 'Trunca con "y 1 más" cuando rest > 5');

    // todayCount reflects the number of payments due today; overdueCount reflects overdue
    assert(todayCount === 2, 'todayCount es 2 (NaranjaX y Brubank vencen hoy)');
    assert(overdueCount === 1, 'overdueCount es 1 (Cable vencido este mes)');

    // Totals section – 1 overdue payment (Cable ARS 1500)
    assert(html.includes('1 vencido'), 'Incluye conteo de pagos vencidos');
    assert(html.includes('text-bg-danger'), 'Usa badge Bootstrap text-bg-danger para totales');
    assert(html.includes('1.500'), 'Incluye cuota total del vencido en ARS');

    // View link
    assert(html.includes('Ver cuotas del mes'), 'Incluye link "Ver cuotas del mes"');
    assert(html.includes('data-notif-navigate'), 'El link tiene atributo data-notif-navigate');
    assert(html.includes('href="/gastos"'), 'El link apunta a /gastos');

    // showInAppPanel dispatches app:upcoming-panel with the html and todayCount
    const events = [];
    const handler = (e) => events.push(e.detail);
    window.addEventListener('app:upcoming-panel', handler);

    showInAppPanel(payments, now);

    assert(events.length === 1, 'showInAppPanel despacha 1 evento app:upcoming-panel');
    assert(typeof events[0].html === 'string', 'El evento incluye html como string');
    assert(events[0].html.includes('NaranjaX'), 'El html del evento incluye datos de los pagos');
    assert(events[0].todayCount === 2, 'El evento incluye todayCount correcto');
    assert(events[0].overdueCount === 1, 'El evento incluye overdueCount correcto');

    window.removeEventListener('app:upcoming-panel', handler);
}

// ===================================================================
// UC12b: buildUpcomingPaymentsHTML – totales multi-moneda en vencidos
// ===================================================================
async function testBuildUpcomingPaymentsHTMLMultiCurrencyTotals() {
    console.log('  UC12b: buildUpcomingPaymentsHTML muestra totales por moneda para pagos vencidos');

    const now = localDate(2026, 4, 3);

    const payments = [
        { acreedor: 'Banco A', cuota: 1000, moneda: 'ARS', vencimiento: '2026-04-01' }, // overdue ARS
        { acreedor: 'Banco B', cuota: 2000, moneda: 'ARS', vencimiento: '2026-04-02' }, // overdue ARS
        { acreedor: 'Banco C', cuota: 100,  moneda: 'USD', vencimiento: '2026-04-02' }, // overdue USD
        { acreedor: 'Banco D', cuota: 500,  moneda: 'ARS', vencimiento: '2026-04-04' }, // upcoming (not overdue)
    ];

    const { html } = buildUpcomingPaymentsHTML(payments, now);

    // Should show "3 vencidos" (2 ARS + 1 USD overdue, upcoming not counted)
    assert(html.includes('3 vencidos'), 'Muestra el conteo correcto de pagos vencidos');
    // ARS total: 1000 + 2000 = 3000
    assert(html.includes('ARS') && html.includes('3.000'), 'Incluye total ARS de vencidos');
    // USD total: 100
    assert(html.includes('USD') && html.includes('100'), 'Incluye total USD de vencidos');
    // Should not include upcoming payment in totals (500 ARS)
    assert(!html.includes('3.500'), 'No suma cuotas próximos en el total vencido');
}

// ===================================================================
// UC13: checkAndNotify – localStorage deduplication
// ===================================================================
async function testCheckAndNotifyDeduplication() {
    console.log('  UC13: checkAndNotify always shows panel; deduplication only applies to native notifications');

    const NOTIFIED_KEY = 'nivva_notified_payments';
    localStorage.removeItem(NOTIFIED_KEY);

    const panelEvents = [];
    const handler = (e) => panelEvents.push(e.detail);
    window.addEventListener('app:upcoming-panel', handler);

    const originalNotification = global.Notification;
    delete global.Notification; // disable native notifications for this test

    const deuda = {
        id: 1,
        acreedor: 'TestBank',
        cuotas: [{ cuota: 500, moneda: 'ARS', vencimiento: '2026-04-04', pagado: false }]
    };

    const { checkAndNotify: can } = await import('../src/features/notifications/NotificationService.js');

    // First call: new payment → panel should appear
    await can([deuda], localDate(2026, 4, 3));
    assert(panelEvents.length === 1, 'Primera llamada debe mostrar el panel');

    // Second call: same payment (already in localStorage) → panel still updates (always shown)
    await can([deuda], localDate(2026, 4, 3));
    assert(panelEvents.length === 2, 'Segunda llamada actualiza el panel siempre que haya vencimientos');

    // Add a new debt → panel should appear again
    const deuda2 = {
        id: 2,
        acreedor: 'NewBank',
        cuotas: [{ cuota: 300, moneda: 'ARS', vencimiento: '2026-04-04', pagado: false }]
    };
    await can([deuda, deuda2], localDate(2026, 4, 3));
    assert(panelEvents.length === 3, 'Nueva deuda también muestra el panel');

    window.removeEventListener('app:upcoming-panel', handler);
    global.Notification = originalNotification;
    localStorage.removeItem(NOTIFIED_KEY);
}

// ===================================================================
// UC14: AppHeader – popover con btn-close y badge con overdueCount
// ===================================================================
async function testNotificationPopoverCloseButtonAndBadge() {
    console.log('  UC14: AppHeader crea el popover con btn-close y el badge muestra overdueCount');

    // Mock bootstrap.Popover to capture options without needing a real DOM render
    const popoversById = new Map();
    let popoverKeyCounter = 0;
    let testPopoverIdCounter = 0;
    const originalBootstrap = window.bootstrap;
    const MockPopover = class {
        constructor(el, opts) {
            this.el = el;
            this.opts = opts;
            this.hideCalls = 0;
            const key = el?.id || `popover-${++popoverKeyCounter}`;
            popoversById.set(key, this);
        }
        dispose() {}
        hide() { this.hideCalls += 1; }
    };
    MockPopover.Default = { allowList: { '*': ['class', 'dir', 'id', 'lang', 'role'], a: ['target', 'href', 'title', 'rel'] } };
    MockPopover.getInstance = (el) => popoversById.get(el?.id);
    window.bootstrap = { Popover: MockPopover };

    // Dynamically import AppHeader (registers 'app-header' custom element)
    await import('../src/layout/AppHeader.js');

    const header = document.createElement('app-header');
    document.body.appendChild(header);

    const actions = header.querySelector('.ms-auto.d-flex');
    const userBtn = header.querySelector('#user-menu-btn');
    assert(actions !== null, 'El header renderiza el contenedor de acciones del navbar');
    assert(actions.firstElementChild?.tagName === 'NOTIFICATIONS-BUTTON', 'El botón de notificaciones es el primer ítem del navbar');
    assert(actions.children[1]?.tagName === 'TOUR-BUTTON', 'El botón del tour queda en el medio del navbar');
    assert(userBtn !== null, 'El header renderiza el ícono de usuario');
    assert(actions.lastElementChild?.tagName === 'USER-MENU-BUTTON', 'El menú de usuario es el último ítem del navbar');

    const userPopover = popoversById.get('user-menu-btn');
    assert(userPopover !== undefined, 'El botón de usuario inicializa un popover de Bootstrap');
    assert(userPopover.opts?.content.includes('list-group'), 'El popover de usuario renderiza list-group');
    assert(userPopover.opts?.content.includes('Configuración'), 'El popover de usuario incluye Configuración');
    assert(userPopover.opts?.trigger === 'click', 'El popover de usuario usa trigger click');

    // Dispatch the panel event as the service would
    window.dispatchEvent(new CustomEvent('app:upcoming-panel', {
        detail: { html: '<p>test</p>', todayCount: 2, overdueCount: 3 },
    }));

    // Verify btn-close is in the popover title
    const notifPopover = popoversById.get('notifications-btn');
    const notifTitle = notifPopover?.opts?.title ?? '';
    assert(typeof notifTitle === 'string', 'El popover recibió un título');
    assert(notifTitle.includes('btn-close'), 'El título del popover incluye btn-close');
    assert(notifTitle.includes('data-notif-close'), 'El título incluye data-notif-close para el handler de cierre');

    // Verify badge shows overdueCount (3), not todayCount (2)
    const btn = header.querySelector('#notifications-btn');
    const badge = btn?.querySelector('.notif-badge');
    assert(badge !== null, 'El botón de notificaciones tiene badge');
    assert(badge.textContent === '3', 'El badge muestra el total de deudas vencidas (overdueCount)');

    const popoverContent = document.createElement('div');
    popoverContent.id = `test-user-popover-${testPopoverIdCounter++}`;
    popoverContent.innerHTML = userPopover.opts?.content || '';
    document.body.appendChild(popoverContent);
    userBtn.setAttribute('aria-describedby', popoverContent.id);
    userBtn.dispatchEvent(new Event('shown.bs.popover'));
    const settingsOption = popoverContent.querySelector('[data-user-settings]');
    assert(settingsOption !== null, 'El contenido del popover incluye la acción Configuración');
    settingsOption.click();

    assert(userPopover.hideCalls === 1, 'Al elegir Configuración, el popover de usuario se cierra');
    const settingsModal = document.querySelector('#settings-data-modal');
    assert(settingsModal !== null, 'Al elegir Configuración, se abre el modal de ajustes');
    userBtn.dispatchEvent(new Event('hidden.bs.popover'));
    userBtn.removeAttribute('aria-describedby');
    settingsModal?.parentElement?.remove();
    document.body.removeChild(popoverContent);

    // === Exclusión mutua entre popovers ===
    // Abrir notificaciones debe cerrar el menú de usuario
    const prevUserHideCalls = userPopover.hideCalls;
    const notifBtn = header.querySelector('#notifications-btn');
    notifBtn.dispatchEvent(new Event('shown.bs.popover', { bubbles: true }));
    assert(userPopover.hideCalls === prevUserHideCalls + 1, 'Cuando se abre el popover de notificaciones, el de usuario debe cerrarse');

    // Abrir menú de usuario debe cerrar notificaciones
    const prevNotifHideCalls = notifPopover?.hideCalls ?? 0;
    userBtn.dispatchEvent(new Event('shown.bs.popover', { bubbles: true }));
    assert((notifPopover?.hideCalls ?? 0) === prevNotifHideCalls + 1, 'Cuando se abre el menú de usuario, el popover de notificaciones debe cerrarse');

    document.body.removeChild(header);
    window.bootstrap = originalBootstrap;
}

// ===================================================================
// UC15: buildUpcomingPaymentsHTML – estado vacío sin pagos
// ===================================================================
async function testBuildUpcomingPaymentsHTMLEmpty() {
    console.log('  UC15: buildUpcomingPaymentsHTML muestra mensaje de estado vacío cuando no hay pagos');

    const { html, todayCount, overdueCount } = buildUpcomingPaymentsHTML([], localDate(2026, 4, 3));

    assert(html.includes('No hay vencimientos próximos'), 'Incluye mensaje de estado vacío');
    assert(html.includes('Buen momento para revisar el mes'), 'Incluye mensaje positivo de estado vacío');
    assert(todayCount === 0, 'todayCount es 0');
    assert(overdueCount === 0, 'overdueCount es 0');
}

// ===================================================================
// UC16: checkAndNotify – siempre inicializa el popover aunque no haya pagos
// ===================================================================
async function testCheckAndNotifyEmptyAlwaysShowsPanel() {
    console.log('  UC16: checkAndNotify despacha app:upcoming-panel incluso sin pagos próximos');

    const panelEvents = [];
    const handler = (e) => panelEvents.push(e.detail);
    window.addEventListener('app:upcoming-panel', handler);

    const { checkAndNotify: can } = await import('../src/features/notifications/NotificationService.js');

    await can([], localDate(2026, 4, 3));

    assert(panelEvents.length === 1, 'Se despacha el evento app:upcoming-panel aunque no haya pagos');
    assert(panelEvents[0].html.includes('No hay vencimientos próximos'), 'El HTML contiene el mensaje de estado vacío');
    assert(panelEvents[0].todayCount === 0, 'todayCount es 0');
    assert(panelEvents[0].overdueCount === 0, 'overdueCount es 0');

    window.removeEventListener('app:upcoming-panel', handler);
}

// ===================================================================
// UC17: navbarPopoversController – wiring compartido de popovers
// ===================================================================
async function testNavbarPopoverControllerSharedWiring() {
    console.log('  UC17: NavbarPopoverController encapsula shown/hidden y exclusión mutua vía lifecycle');

    const hostBtn = document.createElement('button');
    hostBtn.id = 'host-popover-btn';
    document.body.appendChild(hostBtn);

    const otherBtn = document.createElement('button');
    otherBtn.id = 'other-popover-btn';
    document.body.appendChild(otherBtn);

    const popover = { hideCallCount: 0, hide() { this.hideCallCount += 1; } };
    let shownCalls = 0;
    let hiddenCalls = 0;

    const ctrl = document.createElement('navbar-popover-controller');
    ctrl._button = hostBtn;
    ctrl._getPopover = () => popover;
    ctrl._onShown = () => { shownCalls += 1; };
    ctrl._onHidden = () => { hiddenCalls += 1; };
    document.body.appendChild(ctrl);

    hostBtn.dispatchEvent(new Event('shown.bs.popover'));
    assert(shownCalls === 1, 'Disparar shown.bs.popover en el botón host ejecuta onShown');

    otherBtn.dispatchEvent(new Event('shown.bs.popover', { bubbles: true }));
    assert(popover.hideCallCount === 1, 'Abrir otro popover dispara exclusión mutua y oculta el popover host');

    hostBtn.dispatchEvent(new Event('hidden.bs.popover'));
    assert(hiddenCalls === 1, 'Disparar hidden.bs.popover en el botón host ejecuta onHidden');

    ctrl.remove();
    assert(hiddenCalls === 2, 'Remover el controlador llama onHidden como parte del lifecycle (disconnectedCallback)');

    hostBtn.dispatchEvent(new Event('shown.bs.popover'));
    otherBtn.dispatchEvent(new Event('shown.bs.popover', { bubbles: true }));
    assert(shownCalls === 1, 'Luego de remover, shown no vuelve a ejecutarse');
    assert(popover.hideCallCount === 1, 'Luego de remover, la exclusión mutua ya no dispara hide');

    document.body.removeChild(hostBtn);
    document.body.removeChild(otherBtn);
}

// ===================================================================
// UC18: shared/ui/bootstrap – helpers de Bootstrap Popover
// ===================================================================
async function testBootstrapPopoverHelpers() {
    console.log('  UC18: createPopover/destroyPopover encapsulan Bootstrap Popover');

    const originalBootstrap = window.bootstrap;
    let capturedButton = null;
    let capturedOptions = null;
    let disposeCalls = 0;
    const MockPopover = class {
        constructor(el, opts) {
            capturedButton = el;
            capturedOptions = opts;
        }
        dispose() { disposeCalls += 1; }
    };
    window.bootstrap = { Popover: MockPopover };

    const btn = document.createElement('button');
    const popover = createPopover(btn, { trigger: 'focus' });
    assert(popover instanceof MockPopover, 'createPopover devuelve una instancia de bootstrap.Popover');
    assert(capturedButton === btn, 'createPopover usa el elemento recibido');
    assert(capturedOptions?.trigger === 'focus', 'createPopover conserva las opciones recibidas');

    destroyPopover(popover);
    assert(disposeCalls === 1, 'destroyPopover llama dispose en la instancia');

    window.bootstrap = {};
    assert(createPopover(btn, {}) === null, 'createPopover devuelve null si Bootstrap Popover no está disponible');
    destroyPopover(null);

    window.bootstrap = originalBootstrap;
}

async function testBootstrapDropdownHelpers() {
    console.log('  UC18: createDropdown/destroyDropdown encapsulan Bootstrap Dropdown');

    const originalBootstrap = window.bootstrap;
    let capturedButton = null;
    let capturedOptions = null;
    let disposeCalls = 0;
    const MockDropdown = class {
        constructor(el, opts) {
            capturedButton = el;
            capturedOptions = opts;
        }
        dispose() { disposeCalls += 1; }
    };
    window.bootstrap = { ...(originalBootstrap ?? {}), Dropdown: MockDropdown };

    const btn = document.createElement('button');
    const dropdown = createDropdown(btn, { autoClose: 'outside' });
    assert(dropdown instanceof MockDropdown, 'createDropdown devuelve una instancia de bootstrap.Dropdown');
    assert(capturedButton === btn, 'createDropdown usa el elemento recibido');
    assert(capturedOptions?.autoClose === 'outside', 'createDropdown conserva las opciones recibidas');

    destroyDropdown(dropdown);
    assert(disposeCalls === 1, 'destroyDropdown llama dispose en la instancia');

    window.bootstrap = {};
    assert(createDropdown(btn, {}) === null, 'createDropdown devuelve null si Bootstrap Dropdown no está disponible');
    destroyDropdown(null);

    window.bootstrap = originalBootstrap;
}

// ===================================================================
// UC19: navbarPopoversController – factory de popover de navbar
// ===================================================================
async function testNavbarPopoverControllerCreatePopoverFactory() {
    console.log('  UC19: createNavbarPopover aplica defaults de navbar sin perder opciones');

    const originalBootstrap = window.bootstrap;
    let capturedButton = null;
    let capturedOptions = null;
    const MockPopover = class {
        constructor(el, opts) {
            capturedButton = el;
            capturedOptions = opts;
        }
    };
    MockPopover.Default = { allowList: { '*': ['class'], a: ['href'] } };
    window.bootstrap = { Popover: MockPopover };

    const btn = document.createElement('button');
    btn.id = 'factory-test-btn';
    const popover = createNavbarPopover(btn, {
        html: true,
        content: '<p>ok</p>',
        allowList: { a: ['data-notif-navigate'], button: ['type'] },
    });
    assert(popover instanceof MockPopover, 'createNavbarPopover devuelve una instancia de bootstrap.Popover');
    assert(capturedButton === btn, 'createNavbarPopover usa el botón recibido');
    assert(capturedOptions?.trigger === 'click', 'El trigger por defecto se mantiene en click');
    assert(capturedOptions?.container === 'body', 'El contenedor por defecto se mantiene en body');
    assert(capturedOptions?.placement === 'bottom', 'El placement base se mantiene en bottom');
    assert(capturedOptions?.html === true, 'Las opciones personalizadas se mantienen');
    assert(capturedOptions?.allowList?.a?.includes('href'), 'allowList preserva atributos default de Bootstrap');
    assert(capturedOptions?.allowList?.a?.includes('data-notif-navigate'), 'allowList agrega atributos personalizados');
    assert(capturedOptions?.allowList?.button?.includes('type'), 'allowList agrega tags personalizados');

    const popperConfigInput = { placement: 'bottom', strategy: 'fixed', modifiers: [{ name: 'offset', options: { y: 8 } }] };
    const popperConfigResult = capturedOptions?.popperConfig(popperConfigInput);
    assert(popperConfigResult?.placement === 'bottom-end', 'popperConfig ajusta el placement final a bottom-end');
    assert(popperConfigResult?.strategy === 'fixed', 'popperConfig preserva strategy del config original');
    assert(Array.isArray(popperConfigResult?.modifiers), 'popperConfig preserva modifiers del config original');
    assert(popperConfigResult?.modifiers !== popperConfigInput.modifiers, 'popperConfig evita compartir referencia del array modifiers');
    assert(popperConfigResult?.modifiers?.[0] !== popperConfigInput.modifiers[0], 'popperConfig clona cada modifier para evitar mutaciones cruzadas');
    assert(popperConfigResult?.modifiers?.[0].options !== popperConfigInput.modifiers[0].options, 'popperConfig clona options para evitar referencias compartidas');
    assert(popperConfigResult?.modifiers?.[0].options?.y === 8, 'popperConfig preserva el valor interno de options');

    window.bootstrap = originalBootstrap;
}

export const tests = [
    testGetUpcomingPayments,
    testGetUpcomingPaymentsShape,
    testGetUpcomingPaymentsEmpty,
    testStoredPermission,
    testRequestPermissionDeniedSkipsPrompt,
    testCheckAndNotifySendsNotifications,
    testCheckAndNotifySendsOverdueNotifications,
    testCheckAndNotifyUnsupported,
    testShowInAppNotification,
    testShowInAppNotificationOverdue,
    testCheckAndNotifyGroupedNative,
    testShowGroupedInAppNotification,
    testFormatHelpers,
    testBuildUpcomingPaymentsHTML,
    testBuildUpcomingPaymentsHTMLMultiCurrencyTotals,
    testCheckAndNotifyDeduplication,
    testNotificationPopoverCloseButtonAndBadge,
    testBuildUpcomingPaymentsHTMLEmpty,
    testCheckAndNotifyEmptyAlwaysShowsPanel,
    testNavbarPopoverControllerSharedWiring,
    testBootstrapPopoverHelpers,
    testBootstrapDropdownHelpers,
    testNavbarPopoverControllerCreatePopoverFactory,
];
