// Movimientos del mes en orden de fecha; a igual fecha, ingresos, montos y gastos.
export function filasDelMes({ montos = [], ingresos = [], gastos = [] }) {
    const fecha = (fila) => String(fila.ingreso?.fecha ?? fila.gasto?.fecha ?? fila.vencimiento);
    return [
        ...ingresos.map((ingreso) => ({ _kind: 'ingreso', ingreso })),
        ...montos,
        ...gastos.map((gasto) => ({ _kind: 'gasto', gasto })),
    ].sort((a, b) => fecha(a).localeCompare(fecha(b)));
}
