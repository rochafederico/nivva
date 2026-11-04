// El plan que escribe la persona: cuotas, fechas y textos. Nivva no calcula cuotas ni intereses.
import { formatMoneda } from '../../shared/config/monedas.js';

const CUOTA = /^\d+(\.\d{1,2})?$/;

/** Cuotas de un texto como "5000, 5000, 4800.50", o null si alguna no es válida. */
export function leerCuotas(texto) {
    const partes = String(texto ?? '').replace(/\s/g, '').split(',');
    if (partes.length > 120 || !partes.every((p) => CUOTA.test(p) && Number(p) > 0)) return null;
    return partes.map(Number);
}

/** Suma en centavos enteros, sin errores de redondeo. */
export const sumar = (valores) => valores.reduce((suma, v) => suma + Math.round(v * 100), 0) / 100;

/** Un vencimiento por mes; si el mes no tiene ese día, el último del mes. */
export function fechasDelPlan(primera, cantidad) {
    const [anio, mes, dia] = primera.split('-').map(Number);
    return Array.from({ length: cantidad }, (_, i) => {
        const fin = new Date(Date.UTC(anio, mes + i, 0));
        const d = Math.min(dia, fin.getUTCDate());
        return `${fin.getUTCFullYear()}-${String(fin.getUTCMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    });
}

/** Lo que se guarda: cada cuota con su vencimiento y el adelanto, si hay. */
export function armarPlan({ cuotas, primerVencimiento, adelanto, fechaAdelanto }) {
    const montos = leerCuotas(cuotas);
    const fechas = fechasDelPlan(primerVencimiento, montos.length);
    return {
        cuotas: montos.map((monto, i) => ({ monto, vencimiento: fechas[i] })),
        adelanto: Number(adelanto) > 0 ? { monto: Number(adelanto), fecha: fechaAdelanto } : null,
    };
}

export const textoCantidad = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`;

export function textoTotal(cuotas, moneda, adelanto = null) {
    const total = `${textoCantidad(cuotas.length, 'cuota', 'cuotas')}. Total: ${formatMoneda(sumar(cuotas), moneda)}`;
    return adelanto ? `${total}. Adelanto: ${formatMoneda(adelanto, moneda)}.` : total;
}
