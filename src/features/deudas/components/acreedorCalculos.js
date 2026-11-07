// Cálculos de las filas de Acreedores.
/** Pendiente (impago) por moneda de una lista de montos. */
export function computePendiente(montos) {
    const totals = {};
    (montos || []).forEach(m => {
        if (!m.pagado) {
            totals[m.moneda] = (totals[m.moneda] || 0) + Number(m.monto);
        }
    });
    return totals;
}

/** Avance de pagos de un egreso: { pagadas, total, porcentaje, texto: "1 de 2 cuotas" }. */
export function progresoCuotas(montos = []) {
    const total = montos.length;
    const pagadas = montos.filter(m => m.pagado).length;
    const porcentaje = total ? Math.round((pagadas / total) * 100) : 0;
    return { pagadas, total, porcentaje, texto: `${pagadas} de ${total} ${total === 1 ? 'cuota' : 'cuotas'}` };
}
