// src/utils/stats.js
// Utilities to compute monthly financial summaries using existing repositories
export async function getMonthlySummary(mes) {
  // mes expected as 'YYYY-MM' string. If not provided, use current month
  const periodo = mes || new Date().toISOString().slice(0, 7);
  const { sumIngresosByMonth } = await import('../ingresos/ingresoRepository.js');
  const { countCuotasByMes } = await import('../cuotas/cuotaRepository.js');

  const ingresos = await sumIngresosByMonth({ mes: periodo });
  const cuotas = await countCuotasByMes({ mes: periodo });

  // Totales por moneda (desglose)
  const monedas = new Set([
    ...Object.keys(ingresos || {}),
    ...Object.keys(cuotas.totalesPagados || {}),
    ...Object.keys(cuotas.totalesPendientes || {})
  ]);

  const ingresosByCurrency = {};
  const egresosByCurrency = {};
  const saldoByCurrency = {};
  const pagadosByCurrency = {};
  const pendientesByCurrency = {};
  monedas.forEach(m => {
    const ing = Number(ingresos[m] || 0);
    const pag = Number((cuotas.totalesPagados && cuotas.totalesPagados[m]) || 0);
    const pen = Number((cuotas.totalesPendientes && cuotas.totalesPendientes[m]) || 0);
    const eg = pag + pen;
    ingresosByCurrency[m] = ing;
    egresosByCurrency[m] = eg;
    saldoByCurrency[m] = ing - eg;
    pagadosByCurrency[m] = pag;
    pendientesByCurrency[m] = pen;
  });

  return {
    periodo,
    raw: { ingresos, totalesPagados: cuotas.totalesPagados, totalesPendientes: cuotas.totalesPendientes },
    byCurrency: {
      ingresos: ingresosByCurrency,
      egresos: egresosByCurrency,
      saldo: saldoByCurrency,
      pagados: pagadosByCurrency,
      pendientes: pendientesByCurrency
    }
  };
}
