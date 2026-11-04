// Deja cada egreso con los campos que van en la copia de seguridad.
export function mapDeudasParaExportar(deudas) {
    return deudas.map(d => ({
        acreedor: d.acreedor,
        tipoDeuda: d.tipoDeuda,
        notas: d.notas,
        montos: (d.montos || []).map(m => ({
            monto: m.monto,
            moneda: m.moneda,
            vencimiento: m.vencimiento,
            periodo: m.periodo || (m.vencimiento ? m.vencimiento.slice(0, 7) : ''),
            pagado: m.pagado,
        }))
    }));
}
