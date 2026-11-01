// src/features/montos/utils/duplicarMonto.js
// Duplicar un monto (spec 001, criterios 6 y 7). Fechas como texto YYYY-MM-DD, sin zona horaria.

const dosDigitos = (n) => String(n).padStart(2, '0');

/**
 * Vencimiento del duplicado: mismo día que el monto duplicado, en el mes siguiente al
 * último vencimiento de la lista; si ese mes tiene menos días, el último día del mes.
 * @param {string} vencimiento Vencimiento del monto que se duplica.
 * @param {Array<{vencimiento: string}>} montos Montos de la lista.
 * @returns {string}
 */
export function vencimientoDuplicado(vencimiento, montos) {
    const ultimo = montos.map(m => m.vencimiento).filter(Boolean).sort().pop() || vencimiento;
    const [anioUltimo, mesUltimo] = ultimo.split('-').map(Number);
    const dia = Number(vencimiento.split('-')[2]);
    const anio = mesUltimo === 12 ? anioUltimo + 1 : anioUltimo;
    const mes = mesUltimo === 12 ? 1 : mesUltimo + 1;
    const diasDelMes = new Date(anio, mes, 0).getDate();
    return `${anio}-${dosDigitos(mes)}-${dosDigitos(Math.min(dia, diasDelMes))}`;
}

/**
 * Monto nuevo con la misma cifra y moneda, sin pagar, sin id ni período
 * (el período se calcula desde el nuevo vencimiento al guardar).
 * @param {Object} monto Monto que se duplica.
 * @param {Array<Object>} montos Montos de la lista.
 * @returns {Object}
 */
export function duplicarMonto(monto, montos) {
    return {
        monto: monto.monto,
        moneda: monto.moneda,
        vencimiento: vencimientoDuplicado(monto.vencimiento, montos),
        pagado: false
    };
}
