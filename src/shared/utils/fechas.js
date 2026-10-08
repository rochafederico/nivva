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
