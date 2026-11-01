// src/features/montos/utils/montoHablado.js
// Forma hablada (spec 001): lo que dice el lector de pantalla y la confirmación al eliminar.
// Fija en español de Argentina, sin depender de la región del dispositivo.

const NOMBRES_MONEDA = {
    ARS: ['peso', 'pesos'],
    USD: ['dólar', 'dólares']
};

const MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

/**
 * Cifra sin separador de miles: sin decimales si es entera, con dos si tiene centavos.
 * @param {number|string} valor
 * @returns {string}
 */
function cifraHablada(valor) {
    const numero = Number(valor);
    const texto = Number.isInteger(numero) ? String(numero) : numero.toFixed(2);
    return texto.replace('.', ',');
}

/**
 * Monto en la forma hablada: "15000 pesos", "1 dólar", "1,50 pesos".
 * @param {number|string} valor
 * @param {string} moneda Código ISO (ARS, USD).
 * @returns {string}
 */
export function montoHablado(valor, moneda) {
    const [singular, plural] = NOMBRES_MONEDA[moneda] || NOMBRES_MONEDA.ARS;
    return `${cifraHablada(valor)} ${Number(valor) === 1 ? singular : plural}`;
}

/**
 * Fecha YYYY-MM-DD en la forma hablada: "10 de noviembre de 2026".
 * @param {string} isoDate
 * @returns {string}
 */
export function fechaHablada(isoDate) {
    const [anio, mes, dia] = String(isoDate || '').split('-').map(Number);
    if (!anio || !mes || !dia) return String(isoDate || '');
    return `${dia} de ${MESES[mes - 1]} de ${anio}`;
}
