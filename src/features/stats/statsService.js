// src/utils/stats.js
// Utilities to compute monthly financial summaries using existing repositories
function getLocalTodayYmd() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function summarizeGlobalPending(montos = [], today = getLocalTodayYmd()) {
  const vencidoByCurrency = {};
  const futuroByCurrency = {};

  montos.forEach((row) => {
    if (row?.pagado) return;
    const moneda = row?.moneda;
    if (!moneda) return;
    const monto = Number(row?.monto) || 0;
    if (monto === 0) return;
    const vencimiento = typeof row?.vencimiento === 'string' ? row.vencimiento : '';
    const isVencido = Boolean(vencimiento) && vencimiento < today;
    const target = isVencido ? vencidoByCurrency : futuroByCurrency;
    target[moneda] = (target[moneda] || 0) + monto;
  });

  const totalByCurrency = {};
  const monedas = new Set([...Object.keys(vencidoByCurrency), ...Object.keys(futuroByCurrency)]);
  monedas.forEach((moneda) => {
    totalByCurrency[moneda] = (vencidoByCurrency[moneda] || 0) + (futuroByCurrency[moneda] || 0);
  });

  const hasAnyUnpaid = Object.values(totalByCurrency).some((value) => Number(value) > 0);

  return {
    vencidoByCurrency,
    futuroByCurrency,
    totalByCurrency,
    hasAnyUnpaid
  };
}

export async function getMonthlySummary(mes) {
  // mes expected as 'YYYY-MM' string. If not provided, use current month
  const periodo = mes || new Date().toISOString().slice(0, 7);
  const { sumIngresosByMonth } = await import('../ingresos/ingresoRepository.js');
  const { countMontosByMes, listMontos } = await import('../montos/montoRepository.js');

  const ingresos = await sumIngresosByMonth({ mes: periodo });
  const montos = await countMontosByMes({ mes: periodo });
  const montosGlobales = await listMontos();
  const globalPending = summarizeGlobalPending(montosGlobales);

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
    globalPending,
    byCurrency: {
      ingresos: ingresosByCurrency,
      egresos: egresosByCurrency,
      saldo: saldoByCurrency,
      pagados: pagadosByCurrency,
      pendientes: pendientesByCurrency
    }
  };
}
