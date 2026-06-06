// src/utils/stats.js
// Utilities to compute monthly financial summaries using existing repositories
export async function getMonthlySummary(mes) {
  // mes expected as 'YYYY-MM' string. If not provided, use current month
  const periodo = mes || new Date().toISOString().slice(0, 7);
  const { sumIngresosByMonth } = await import('../ingresos/ingresoRepository.js');
  const { countMontosByMes } = await import('../montos/montoRepository.js');

  const ingresos = await sumIngresosByMonth({ mes: periodo });
  const montos = await countMontosByMes({ mes: periodo });

  // Totales por moneda (desglose)
  const monedas = new Set([
    ...Object.keys(ingresos || {}),
    ...Object.keys(montos.totalesPagados || {}),
    ...Object.keys(montos.totalesPendientes || {})
  ]);

  const ingresosByCurrency = {};
  const egresosByCurrency = {};
  const saldoByCurrency = {};
  const pagadosByCurrency = {};
  const pendientesByCurrency = {};
  monedas.forEach(m => {
    const ing = Number(ingresos[m] || 0);
    const pag = Number((montos.totalesPagados && montos.totalesPagados[m]) || 0);
    const pen = Number((montos.totalesPendientes && montos.totalesPendientes[m]) || 0);
    const eg = pag + pen;
    ingresosByCurrency[m] = ing;
    egresosByCurrency[m] = eg;
    saldoByCurrency[m] = ing - eg;
    pagadosByCurrency[m] = pag;
    pendientesByCurrency[m] = pen;
  });

  return {
    periodo,
    raw: { ingresos, totalesPagados: montos.totalesPagados, totalesPendientes: montos.totalesPendientes },
    byCurrency: {
      ingresos: ingresosByCurrency,
      egresos: egresosByCurrency,
      saldo: saldoByCurrency,
      pagados: pagadosByCurrency,
      pendientes: pendientesByCurrency
    }
  };
}

function addAmount(target, currency, amount) {
  target[currency] = (target[currency] || 0) + (Number(amount) || 0);
}

function isOverduePayment(payment, todayISO) {
  const dueDate = typeof payment.vencimiento === 'string' ? payment.vencimiento.slice(0, 10) : '';
  return Boolean(dueDate && dueDate < todayISO);
}

export function summarizeGlobalPayments(montos = [], todayISO = new Date().toISOString().slice(0, 10)) {
  const totalDue = {};
  const overdue = {};
  const upcoming = {};
  const counts = {
    totalDue: 0,
    overdue: 0,
    upcoming: 0
  };

  (montos || []).forEach((payment) => {
    if (!payment || payment.pagado) return;

    counts.totalDue += 1;
    addAmount(totalDue, payment.moneda, payment.monto);

    if (isOverduePayment(payment, todayISO)) {
      counts.overdue += 1;
      addAmount(overdue, payment.moneda, payment.monto);
      return;
    }

    counts.upcoming += 1;
    addAmount(upcoming, payment.moneda, payment.monto);
  });

  return {
    byCurrency: {
      totalDue,
      overdue,
      upcoming
    },
    counts
  };
}

export async function getGlobalPaymentSummary() {
  const { listMontos } = await import('../montos/montoRepository.js');
  const montos = await listMontos();
  return summarizeGlobalPayments(montos);
}
