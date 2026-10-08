// src/shared/utils/fechas.js
// Formateo de fechas para mostrar en la UI.

/**
 * Convierte una fecha ISO (YYYY-MM-DD) a DD/MM/YYYY.
 * Si el valor no tiene ese formato lo devuelve tal cual (o vacío si no hay valor).
 * @param {string} isoDate
 * @returns {string}
 */
export function formatFecha(isoDate) {
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(String(isoDate))) return String(isoDate || '');
    const [y, m, d] = String(isoDate).split('-');
    return `${d}/${m}/${y}`;
}

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/**
 * Fecha corta para listas del mes: "05 oct" (sin año; el mes ya está en el selector).
 * Si el valor no tiene formato YYYY-MM-DD lo devuelve tal cual.
 * @param {string} isoDate
 * @returns {string}
 */
export function formatFechaCorta(isoDate) {
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(String(isoDate))) return String(isoDate || '');
    const [, m, d] = String(isoDate).split('-');
    return `${d} ${MESES_CORTOS[Number(m) - 1]}`;
}
