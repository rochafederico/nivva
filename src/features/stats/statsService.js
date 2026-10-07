// src/utils/stats.js
// Utilities to compute monthly financial summaries using existing repositories

function localTodayYmd() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Cantidades del mes (independientes de la moneda) para los textos de detalle de los KPIs.
 * @param {Array<{pagado?: boolean, vencimiento?: string}>} montos
 * @param {number} ingresosCount
 * @param {string} [today] - YYYY-MM-DD local; un monto impago con vencimiento anterior está vencido
 */
export function countMonthly(montos = [], ingresosCount = 0, today = localTodayYmd()) {
  const pagados = montos.filter(m => m.pagado).length;
  const vencidos = montos.filter(m => {
    const v = typeof m.vencimiento === 'string' ? m.vencimiento.trim() : '';
    return !m.pagado && /^\d{4}-\d{2}-\d{2}$/.test(v) && v < today;
  }).length;
  return {
    ingresos: ingresosCount,
    montos: montos.length,
    pagados,
    pendientes: montos.length - pagados,
    vencidos,
  };
}

export async function getMonthlySummary(mes) {
  // mes expected as 'YYYY-MM' string. If not provided, use current month
  const periodo = mes || new Date().toISOString().slice(0, 7);
  const { sumIngresosByMonth, listIngresos } = await import('../ingresos/ingresoRepository.js');
  const { countMontosByMes, listMontos } = await import('../montos/montoRepository.js');

  const [ingresos, montos, ingresosList, montosList] = await Promise.all([
    sumIngresosByMonth({ mes: periodo }),
    countMontosByMes({ mes: periodo }),
    listIngresos({ mes: periodo }),
    listMontos({ mes: periodo }),
  ]);

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
    counts: countMonthly(montosList, ingresosList.length),
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
